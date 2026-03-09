import ast
import json
from datetime import datetime, timezone
from typing import Any

from firebase_functions import pubsub_fn
from firebase_functions.options import set_global_options
from firebase_admin import firestore, initialize_app

set_global_options(max_instances=10)

initialize_app()
_db = None

DEFAULT_DEVICE_ID = "device-unknown"
DEVICES_COLLECTION = "devices"
DAILY_COLLECTION = "daily"
WEEKLY_COLLECTION = "weekly"
STATE_COLLECTION = "state"

WEEKLY_SUMMABLE_FIELDS = {
    "Va",  # tensao de fase A
    "Vb",  # tensao de fase B
    "Vc",  # tensao de fase C
    "Ia",  # corrente de fase A
    "Ib",  # corrente de fase B
    "Ic",  # corrente de fase C
    "In",  # corrente neutro
    "angVa",  # angulo de fase A
    "angVb",  # angulo de fase B
    "angVc",  # angulo de fase C
    "angIa",  # angulo de fase A
    "angIb",  # angulo de fase B
    "angIc",  # angulo de fase C
    "Pdir",  # potencia ativa total
    "Prev",  # potencia reativa total
    "Q",  # potencia aparente total
    "S",  # potencia total
    "Ph",  # potencia harmonica
    "fpa",  # fator de potencia de fase A
    "fpb",  # fator de potencia de fase B
    "fpc",  # fator de potencia de fase C
    "fpt",  # fator de potencia total
    "f",  # frequencia
    "t",  # temperatura
    "Pa",  # potencia ativa de fase A
    "Pb",  # potencia ativa de fase B
    "Pc",  # potencia ativa de fase C
    "Ea",  # energia ativa de fase A
    "Eb",  # energia ativa de fase B
    "Ec",  # energia ativa de fase C
    "Ear",  # energia reativa fase A
    "Ebr",  # energia reativa fase B
    "Ecr",  # energia reativa fase C
    "Era",  # energia reversa fase A
    "Erb",  # energia reversa fase B
    "Erc",  # energia reversa fase C
    "Erar",  # energia reversa reativa fase A
    "Erbr",  # energia reversa reativa fase B
    "Ercr",  # energia reversa reativa fase C
}

CT_PT_SCALED_FIELDS = {
    "Pa",
    "Pb",
    "Pc",
    "Pdir",
    "Prev",
    "Q",
    "S",
    "Ph",
    "Ea",
    "Eb",
    "Ec",
    "Ear",
    "Ebr",
    "Ecr",
    "Era",
    "Erb",
    "Erc",
    "Erar",
    "Erbr",
    "Ercr",
}

RTC_SCALED_FIELDS = {
    "Ia",
    "Ib",
    "Ic",
    "In",
}

RTP_SCALED_FIELDS = {
    "Va",
    "Vb",
    "Vc",
}


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


def _parse_payload(raw_payload: Any):
    if isinstance(raw_payload, dict):
        return raw_payload

    if isinstance(raw_payload, (bytes, bytearray)):
        raw_payload = raw_payload.decode("utf-8", errors="ignore")

    if isinstance(raw_payload, str):
        value = raw_payload.strip()
        if not value:
            return {}

        candidates = [value]
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            unwrapped = value[1:-1].strip()
            if unwrapped:
                candidates.append(unwrapped)

        for candidate in candidates:
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    return parsed
                if isinstance(parsed, str):
                    nested = _parse_payload(parsed)
                    if isinstance(nested, dict):
                        return nested
            except json.JSONDecodeError:
                pass

            # Accept payload serialized as Python dict (single quotes)
            try:
                parsed = ast.literal_eval(candidate)
                if isinstance(parsed, dict):
                    return parsed
                if isinstance(parsed, str):
                    nested = _parse_payload(parsed)
                    if isinstance(nested, dict):
                        return nested
            except (SyntaxError, ValueError):
                pass

        return {"rawPayload": value}

    return {"rawPayload": raw_payload}


def _extract_measurements(raw_payload):
    parsed = _parse_payload(raw_payload)

    if not isinstance(parsed, dict):
        return {}

    # When message comes from Cloud Logging, useful data may live in textPayload.
    if "textPayload" in parsed:
        inner = _parse_payload(parsed.get("textPayload"))
        if isinstance(inner, dict):
            return inner

    # Some publishers use jsonPayload.
    if "jsonPayload" in parsed:
        inner = _parse_payload(parsed.get("jsonPayload"))
        if isinstance(inner, dict):
            return inner

    return parsed


def _to_json_log(value: Any) -> str:
    try:
        return json.dumps(value, ensure_ascii=False, default=str)
    except TypeError:
        return str(value)


def _coerce_numbers(data: dict) -> dict:
    coerced = {}

    for key, value in data.items():
        if isinstance(value, str):
            normalized = value.strip().replace(",", ".")
            try:
                coerced[key] = float(normalized)
                continue
            except ValueError:
                pass

        coerced[key] = value

    return coerced


def _only_numeric_fields(data: dict) -> dict:
    numeric_data = {}

    for key, value in data.items():
        if isinstance(value, bool):
            continue
        if isinstance(value, (int, float)):
            numeric_data[key] = float(value)

    return numeric_data


def _valid_ratio_or_default(value: Any, default: float = 1.0) -> float:
    if isinstance(value, bool):
        return default
    if isinstance(value, (int, float)):
        ratio = float(value)
        if ratio > 0:
            return ratio
    return default


def _apply_measurement_scaling(payload_numeric: dict) -> dict:
    rtc_ratio = _valid_ratio_or_default(payload_numeric.get("RTC"), default=1.0)
    rtp_ratio = _valid_ratio_or_default(payload_numeric.get("RTP"), default=1.0)
    scaling_factor = rtc_ratio * rtp_ratio

    if rtc_ratio == 1.0 and rtp_ratio == 1.0 and scaling_factor == 1.0:
        return payload_numeric

    scaled_payload = dict(payload_numeric)

    def _scale_fields(fields: set[str], factor: float):
        if factor == 1.0:
            return
        for key in fields:
            value = scaled_payload.get(key)
            if isinstance(value, (int, float)):
                scaled_payload[key] = float(value) * factor

    _scale_fields(RTC_SCALED_FIELDS, rtc_ratio)
    _scale_fields(RTP_SCALED_FIELDS, rtp_ratio)
    _scale_fields(CT_PT_SCALED_FIELDS, scaling_factor)

    return scaled_payload


def _only_weekly_summable_fields(data: dict) -> dict:
    return {
        key: value
        for key, value in data.items()
        if key in WEEKLY_SUMMABLE_FIELDS and isinstance(value, (int, float))
    }


def _coerce_event_time(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    if isinstance(value, str):
        text = value.strip()
        if not text:
            return None
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(text)
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            return None

    return None


def _should_save_weekly(event_time):
    reference_time = _coerce_event_time(event_time)
    if reference_time is None:
        reference_time = datetime.now(timezone.utc)
    return reference_time.minute % 10 == 0


def _normalize_device_id(value: Any) -> str:
    if value is None:
        return DEFAULT_DEVICE_ID

    text = str(value).strip()
    if not text:
        return DEFAULT_DEVICE_ID

    sanitized = "".join(char for char in text if char.isalnum() or char in ("-", "_"))
    sanitized = sanitized.strip("-_")

    if not sanitized:
        return DEFAULT_DEVICE_ID

    return sanitized[:120]


def _extract_device_id(measurements: dict) -> str:
    name_candidate = _normalize_device_id(measurements.get("Nome"))
    if name_candidate != DEFAULT_DEVICE_ID:
        return name_candidate

    candidates = (
        "deviceId",
        "device_id",
        "idDispositivo",
        "dispositivoId",
        "gatewayId",
    )

    for key in candidates:
        if key not in measurements:
            continue
        candidate = _normalize_device_id(measurements.get(key))
        if candidate != DEFAULT_DEVICE_ID:
            return candidate

    return DEFAULT_DEVICE_ID


def _extract_device_name(measurements: dict) -> str | None:
    name = measurements.get("Nome")
    if name is None:
        return None
    text = str(name).strip()
    return text if text else None


def _hour_bucket_id(reference_time: datetime) -> str:
    return reference_time.strftime("%Y-%m-%d_%H")


def _day_key(reference_time: datetime) -> str:
    return reference_time.strftime("%Y-%m-%d")


def _week_key(reference_time: datetime) -> str:
    iso_year, iso_week, _ = reference_time.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"


def _start_of_hour(reference_time: datetime) -> datetime:
    return reference_time.replace(minute=0, second=0, microsecond=0)


def _start_of_week(reference_time: datetime) -> datetime:
    iso_year, iso_week, _ = reference_time.isocalendar()
    start = datetime.fromisocalendar(iso_year, iso_week, 1)
    return start.replace(tzinfo=timezone.utc)


def _build_weekly_updates(payload: dict) -> dict:
    updates = {}
    for key, value in payload.items():
        updates[f"sums.{key}"] = firestore.Increment(float(value))
    return updates


@pubsub_fn.on_message_published(topic="rawData")
def on_raw_data(event: pubsub_fn.CloudEvent[pubsub_fn.MessagePublishedData]):
    raw_payload = event.data.message.json
    if raw_payload is None:
        raw_payload = event.data.message.data

    print(f"rawData payload bruto: {_to_json_log(raw_payload)}")

    measurements = _extract_measurements(raw_payload)
    device_id = _extract_device_id(measurements)
    device_name = _extract_device_name(measurements)
    payload_numeric = _only_numeric_fields(_coerce_numbers(measurements))
    payload_numeric = _apply_measurement_scaling(payload_numeric)
    payload_weekly_summable = _only_weekly_summable_fields(payload_numeric)

    event_time = _coerce_event_time(getattr(event, "time", None))
    if event_time is None:
        event_time = datetime.now(timezone.utc)

    if not payload_numeric:
        print(
            "rawData ignorado: sem campos numericos. "
            f"eventId={event.id} deviceId={device_id}"
        )
        return

    reading = {
        "createdAt": event_time,
        **payload_numeric,
    }

    db = _get_db()
    device_ref = db.collection(DEVICES_COLLECTION).document(device_id)

    daily_doc_ref = device_ref.collection(DAILY_COLLECTION).document(_hour_bucket_id(event_time))
    daily_doc_ref.set(
        {
            "deviceId": device_id,
            "deviceName": device_name,
            "dayKey": _day_key(event_time),
            "bucketType": "hour",
            "bucketStart": _start_of_hour(event_time),
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "count": firestore.Increment(1),
            "readings": firestore.ArrayUnion([reading]),
        },
        merge=True,
    )

    latest_ref = device_ref.collection(STATE_COLLECTION).document("latest")
    latest_ref.set(
        {
            "deviceId": device_id,
            "deviceName": device_name,
            **payload_numeric,
            "eventAt": event_time,
            "createdAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    saved_weekly = False
    if _should_save_weekly(event_time):
        week_key = _week_key(event_time)
        week_ref = device_ref.collection(WEEKLY_COLLECTION).document(week_key)
        week_ref.set(
            {
                "deviceId": device_id,
                "deviceName": device_name,
                "weekKey": week_key,
                "weekStart": _start_of_week(event_time),
                "lastSampleAt": event_time,
                "updatedAt": firestore.SERVER_TIMESTAMP,
                "sampleCount": firestore.Increment(1),
                "last": payload_numeric,
                "lastSummable": payload_weekly_summable,
                **_build_weekly_updates(payload_weekly_summable),
            },
            merge=True,
        )
        saved_weekly = True

    print(
        "telemetria salva. "
        f"campos={len(payload_numeric)} "
        f"eventId={event.id} "
        f"deviceId={device_id} "
        f"savedWeekly={saved_weekly}"
    )
