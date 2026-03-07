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

ALLOWED_FIELDS = {
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
    "Ph",  # fator de potencia total
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

        try:
            return json.loads(value)
        except json.JSONDecodeError:
            # Accept payload serialized as Python dict (single quotes)
            try:
                parsed = ast.literal_eval(value)
                if isinstance(parsed, dict):
                    return parsed
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
        if key not in ALLOWED_FIELDS:
            continue
        if isinstance(value, bool):
            continue
        if isinstance(value, (int, float)):
            numeric_data[key] = float(value)

    return numeric_data


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
    candidates = (
        "deviceId",
        "device_id",
        "idDispositivo",
        "dispositivoId",
        "gatewayId",
    )

    for key in candidates:
        if key in measurements:
            return _normalize_device_id(measurements.get(key))

    return DEFAULT_DEVICE_ID


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

    measurements = _extract_measurements(raw_payload)
    device_id = _extract_device_id(measurements)
    payload = _only_numeric_fields(_coerce_numbers(measurements))

    event_time = _coerce_event_time(getattr(event, "time", None))
    if event_time is None:
        event_time = datetime.now(timezone.utc)

    if not payload:
        print(
            "rawData ignorado: sem campos numericos. "
            f"eventId={event.id} deviceId={device_id}"
        )
        return

    reading = {
        "createdAt": event_time,
        **payload,
    }

    db = _get_db()
    device_ref = db.collection(DEVICES_COLLECTION).document(device_id)

    daily_doc_ref = device_ref.collection(DAILY_COLLECTION).document(_hour_bucket_id(event_time))
    daily_doc_ref.set(
        {
            "deviceId": device_id,
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
            **payload,
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
                "weekKey": week_key,
                "weekStart": _start_of_week(event_time),
                "lastSampleAt": event_time,
                "updatedAt": firestore.SERVER_TIMESTAMP,
                "sampleCount": firestore.Increment(1),
                "last": payload,
                **_build_weekly_updates(payload),
            },
            merge=True,
        )
        saved_weekly = True

    print(
        "telemetria salva. "
        f"campos={len(payload)} "
        f"eventId={event.id} "
        f"deviceId={device_id} "
        f"savedWeekly={saved_weekly}"
    )
