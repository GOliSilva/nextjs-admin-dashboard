import ast
import json
import math
import traceback
from datetime import datetime, timezone
from typing import Any

from firebase_functions import pubsub_fn
from firebase_functions.options import set_global_options
from firebase_admin import firestore, initialize_app
from google.api_core import exceptions as gcloud_exceptions

set_global_options(max_instances=10)

initialize_app()
_db = None

DEFAULT_DEVICE_ID = "device-unknown"
DEVICES_COLLECTION = "devices"
DAILY_COLLECTION = "daily"
DAILY_AGG_COLLECTION = "daily_agg"
WEEKLY_COLLECTION = "weekly"
STATE_COLLECTION = "state"
DAILY_AGG_ERROR_FIELD = "dailyAggError"
GLOBAL_MIN_FIELD = "globalMin"
GLOBAL_MAX_FIELD = "globalMax"
GLOBAL_AVG_FIELD = "globalAvg"
GLOBAL_SUM_FIELD = "globalSum"
GLOBAL_COUNT_FIELD = "globalCount"

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

ANGLE_FIELDS = {
    "angVa",
    "angVb",
    "angVc",
    "angIa",
    "angIb",
    "angIc",
}


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


def _coerce_update_time(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    to_datetime = getattr(value, "ToDatetime", None)
    if callable(to_datetime):
        try:
            parsed = to_datetime()
            if isinstance(parsed, datetime):
                if parsed.tzinfo is None:
                    return parsed.replace(tzinfo=timezone.utc)
                return parsed.astimezone(timezone.utc)
        except Exception:
            return None

    return None


def _safe_float(value: Any) -> float | None:
    if isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):
        number = float(value)
    elif isinstance(value, str):
        normalized = value.strip().replace(",", ".")
        if not normalized:
            return None
        try:
            number = float(normalized)
        except ValueError:
            return None
    else:
        return None

    if not math.isfinite(number):
        return None

    return number


def _sanitize_number_map(value: Any) -> dict[str, float]:
    if not isinstance(value, dict):
        return {}

    sanitized: dict[str, float] = {}
    for key, raw_value in value.items():
        if not isinstance(key, str):
            continue
        number = _safe_float(raw_value)
        if number is None:
            continue
        sanitized[key] = number

    return sanitized


def _copy_number_map(value: dict[str, float]) -> dict[str, float]:
    return {key: float(number) for key, number in value.items()}


def _empty_state_stats() -> dict[str, Any]:
    return {
        GLOBAL_MIN_FIELD: {},
        GLOBAL_MAX_FIELD: {},
        GLOBAL_AVG_FIELD: {},
        GLOBAL_SUM_FIELD: {},
        GLOBAL_COUNT_FIELD: {},
        "readCount": 0.0,
        "updateTime": None,
    }


def _clone_state_stats(stats: dict[str, Any]) -> dict[str, Any]:
    return {
        GLOBAL_MIN_FIELD: _copy_number_map(stats.get(GLOBAL_MIN_FIELD, {}) or {}),
        GLOBAL_MAX_FIELD: _copy_number_map(stats.get(GLOBAL_MAX_FIELD, {}) or {}),
        GLOBAL_AVG_FIELD: _copy_number_map(stats.get(GLOBAL_AVG_FIELD, {}) or {}),
        GLOBAL_SUM_FIELD: _copy_number_map(stats.get(GLOBAL_SUM_FIELD, {}) or {}),
        GLOBAL_COUNT_FIELD: _copy_number_map(stats.get(GLOBAL_COUNT_FIELD, {}) or {}),
        "readCount": _safe_float(stats.get("readCount")) or 0.0,
        "updateTime": _coerce_update_time(stats.get("updateTime")),
    }


def _derive_read_count(global_count: dict[str, float]) -> float:
    if not global_count:
        return 0.0

    return max(0.0, max(global_count.values()))


def _extract_state_stats_from_doc(snapshot: firestore.DocumentSnapshot) -> dict[str, Any]:
    if not snapshot.exists:
        return _empty_state_stats()

    data = snapshot.to_dict() or {}
    global_min = _sanitize_number_map(data.get(GLOBAL_MIN_FIELD))
    global_max = _sanitize_number_map(data.get(GLOBAL_MAX_FIELD))
    global_avg = _sanitize_number_map(data.get(GLOBAL_AVG_FIELD))
    global_sum = _sanitize_number_map(data.get(GLOBAL_SUM_FIELD))
    global_count = _sanitize_number_map(data.get(GLOBAL_COUNT_FIELD))

    for key, count_value in global_count.items():
        if key in global_sum:
            continue
        if key not in global_avg:
            continue
        global_sum[key] = global_avg[key] * count_value

    return {
        GLOBAL_MIN_FIELD: global_min,
        GLOBAL_MAX_FIELD: global_max,
        GLOBAL_AVG_FIELD: global_avg,
        GLOBAL_SUM_FIELD: global_sum,
        GLOBAL_COUNT_FIELD: global_count,
        "readCount": _derive_read_count(global_count),
        "updateTime": _coerce_update_time(snapshot.update_time),
    }


def _load_state_stats(
    latest_ref: firestore.DocumentReference,
) -> dict[str, Any]:
    snapshot = latest_ref.get()
    state_stats = _extract_state_stats_from_doc(snapshot)
    return _clone_state_stats(state_stats)


def _compute_next_state_stats(
    state_stats: dict[str, Any],
    payload_numeric: dict[str, float],
) -> dict[str, Any]:
    global_min = _copy_number_map(state_stats.get(GLOBAL_MIN_FIELD, {}) or {})
    global_max = _copy_number_map(state_stats.get(GLOBAL_MAX_FIELD, {}) or {})
    global_avg = _copy_number_map(state_stats.get(GLOBAL_AVG_FIELD, {}) or {})
    global_sum = _copy_number_map(state_stats.get(GLOBAL_SUM_FIELD, {}) or {})
    global_count = _copy_number_map(state_stats.get(GLOBAL_COUNT_FIELD, {}) or {})

    incoming_values: dict[str, float] = {}
    for key, raw_value in payload_numeric.items():
        number = _safe_float(raw_value)
        if number is None:
            continue
        incoming_values[key] = number

    tracked_keys = (
        set(global_min.keys())
        | set(global_max.keys())
        | set(global_avg.keys())
        | set(global_sum.keys())
        | set(global_count.keys())
        | set(incoming_values.keys())
    )

    previous_read_count = _safe_float(state_stats.get("readCount"))
    if previous_read_count is None:
        previous_read_count = _derive_read_count(global_count)
    previous_read_count = max(0.0, previous_read_count)
    next_read_count = previous_read_count + 1.0

    for key in tracked_keys:
        had_metric = (
            key in global_min
            or key in global_max
            or key in global_avg
            or key in global_sum
            or key in global_count
        )

        previous_metric_count = _safe_float(global_count.get(key))
        if previous_metric_count is None:
            previous_metric_count = previous_read_count if had_metric else 0.0
        previous_metric_count = max(0.0, previous_metric_count)

        next_metric_count = (
            previous_metric_count + 1.0 if had_metric else next_read_count
        )
        global_count[key] = next_metric_count

        previous_sum = _safe_float(global_sum.get(key))
        if previous_sum is None:
            previous_sum = 0.0

        incoming_value = incoming_values.get(key)
        if incoming_value is not None:
            global_sum[key] = previous_sum + incoming_value
            current_min = _safe_float(global_min.get(key))
            current_max = _safe_float(global_max.get(key))
            global_min[key] = (
                incoming_value
                if current_min is None
                else min(current_min, incoming_value)
            )
            global_max[key] = (
                incoming_value
                if current_max is None
                else max(current_max, incoming_value)
            )
        else:
            global_sum[key] = previous_sum

        if next_metric_count > 0:
            global_avg[key] = global_sum[key] / next_metric_count
        else:
            global_avg[key] = 0.0

    return {
        GLOBAL_MIN_FIELD: global_min,
        GLOBAL_MAX_FIELD: global_max,
        GLOBAL_AVG_FIELD: global_avg,
        GLOBAL_SUM_FIELD: global_sum,
        GLOBAL_COUNT_FIELD: global_count,
        "readCount": next_read_count,
        "updateTime": _coerce_update_time(state_stats.get("updateTime")),
    }


def _build_latest_state_payload(
    *,
    device_id: str,
    device_name: str | None,
    payload_numeric: dict[str, float],
    event_time: datetime,
    state_stats: dict[str, Any],
) -> dict[str, Any]:
    return {
        "deviceId": device_id,
        "deviceName": device_name,
        **payload_numeric,
        "eventAt": event_time,
        "createdAt": firestore.SERVER_TIMESTAMP,
        GLOBAL_MIN_FIELD: _copy_number_map(state_stats.get(GLOBAL_MIN_FIELD, {}) or {}),
        GLOBAL_MAX_FIELD: _copy_number_map(state_stats.get(GLOBAL_MAX_FIELD, {}) or {}),
        GLOBAL_AVG_FIELD: _copy_number_map(state_stats.get(GLOBAL_AVG_FIELD, {}) or {}),
        GLOBAL_SUM_FIELD: _copy_number_map(state_stats.get(GLOBAL_SUM_FIELD, {}) or {}),
        GLOBAL_COUNT_FIELD: _copy_number_map(state_stats.get(GLOBAL_COUNT_FIELD, {}) or {}),
    }


def _is_state_write_conflict(error: Exception) -> bool:
    return isinstance(
        error,
        (
            gcloud_exceptions.FailedPrecondition,
            gcloud_exceptions.Aborted,
            gcloud_exceptions.NotFound,
            gcloud_exceptions.AlreadyExists,
        ),
    )


def _write_latest_state(
    latest_ref: firestore.DocumentReference,
    payload: dict[str, Any],
    *,
    expected_update_time: datetime | None,
):
    if expected_update_time is None:
        return latest_ref.create(payload)

    return latest_ref.update(
        payload,
        option=firestore.LastUpdateOption(expected_update_time),
    )


def _save_latest_state_with_global_stats(
    *,
    latest_ref: firestore.DocumentReference,
    device_id: str,
    device_name: str | None,
    payload_numeric: dict[str, float],
    event_time: datetime,
):
    baseline_state_stats = _load_state_stats(latest_ref)
    next_state_stats = _compute_next_state_stats(baseline_state_stats, payload_numeric)
    payload = _build_latest_state_payload(
        device_id=device_id,
        device_name=device_name,
        payload_numeric=payload_numeric,
        event_time=event_time,
        state_stats=next_state_stats,
    )

    try:
        write_result = _write_latest_state(
            latest_ref,
            payload,
            expected_update_time=baseline_state_stats.get("updateTime"),
        )
    except Exception as error:
        if not _is_state_write_conflict(error):
            raise

        refreshed_state_stats = _load_state_stats(latest_ref)
        next_state_stats = _compute_next_state_stats(
            refreshed_state_stats,
            payload_numeric,
        )
        payload = _build_latest_state_payload(
            device_id=device_id,
            device_name=device_name,
            payload_numeric=payload_numeric,
            event_time=event_time,
            state_stats=next_state_stats,
        )
        write_result = _write_latest_state(
            latest_ref,
            payload,
            expected_update_time=refreshed_state_stats.get("updateTime"),
        )

    next_state_stats["updateTime"] = _coerce_update_time(
        getattr(write_result, "update_time", None)
    )


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


def _normalize_angles(payload_numeric: dict) -> dict:
    normalized_payload = dict(payload_numeric)

    for key in ANGLE_FIELDS:
        value = normalized_payload.get(key)
        if not isinstance(value, (int, float)):
            continue
        angle = float(value)
        if angle > 180.0:
            normalized_payload[key] = angle - 360.0

    return normalized_payload


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


def _start_of_day(reference_time: datetime) -> datetime:
    return reference_time.replace(hour=0, minute=0, second=0, microsecond=0)


def _start_of_week(reference_time: datetime) -> datetime:
    iso_year, iso_week, _ = reference_time.isocalendar()
    start = datetime.fromisocalendar(iso_year, iso_week, 1)
    return start.replace(tzinfo=timezone.utc)


def _build_weekly_updates(payload: dict) -> dict:
    updates = {}
    for key, value in payload.items():
        updates[f"sums.{key}"] = firestore.Increment(float(value))
    return updates


def _log_daily_agg_error(
    *,
    event_id: str,
    device_id: str,
    day_key: str,
    event_time: datetime,
    latest_ref: firestore.DocumentReference,
    error: Exception,
):
    print(
        "erro ao salvar daily_agg. "
        f"eventId={event_id} "
        f"deviceId={device_id} "
        f"dayKey={day_key} "
        f"errorType={type(error).__name__} "
        f"error={error}"
    )
    print(traceback.format_exc())

    try:
        latest_ref.set(
            {
                DAILY_AGG_ERROR_FIELD: {
                    "eventId": event_id,
                    "deviceId": device_id,
                    "dayKey": day_key,
                    "eventAt": event_time,
                    "errorType": type(error).__name__,
                    "message": str(error),
                    "loggedAt": firestore.SERVER_TIMESTAMP,
                }
            },
            merge=True,
        )
    except Exception as state_error:
        print(
            "erro ao salvar log de erro daily_agg em state/latest. "
            f"eventId={event_id} "
            f"deviceId={device_id} "
            f"errorType={type(state_error).__name__} "
            f"error={state_error}"
        )
        print(traceback.format_exc())


@firestore.transactional
def _save_daily_agg_reading(
    transaction: firestore.Transaction,
    doc_ref: firestore.DocumentReference,
    *,
    device_id: str,
    device_name: str | None,
    day_key: str,
    event_time: datetime,
    reading: dict,
    payload_numeric: dict,
):
    payload = {
        "deviceId": device_id,
        "deviceName": device_name,
        "dayKey": day_key,
        "bucketType": "day",
        "bucketStart": _start_of_day(event_time),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "count": firestore.Increment(1),
        "lastSampleAt": event_time,
        "last": payload_numeric,
        "readings": firestore.ArrayUnion([reading]),
    }

    transaction.set(doc_ref, payload, merge=True)


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
    payload_numeric = _normalize_angles(payload_numeric)
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
    day_key = _day_key(event_time)

    daily_doc_ref = device_ref.collection(DAILY_COLLECTION).document(_hour_bucket_id(event_time))
    daily_doc_ref.set(
        {
            "deviceId": device_id,
            "deviceName": device_name,
            "dayKey": day_key,
            "bucketType": "hour",
            "bucketStart": _start_of_hour(event_time),
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "count": firestore.Increment(1),
            "readings": firestore.ArrayUnion([reading]),
        },
        merge=True,
    )

    latest_ref = device_ref.collection(STATE_COLLECTION).document("latest")
    _save_latest_state_with_global_stats(
        latest_ref=latest_ref,
        device_id=device_id,
        device_name=device_name,
        payload_numeric=payload_numeric,
        event_time=event_time,
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

    try:
        daily_agg_ref = device_ref.collection(DAILY_AGG_COLLECTION).document(day_key)
        _save_daily_agg_reading(
            db.transaction(),
            daily_agg_ref,
            device_id=device_id,
            device_name=device_name,
            day_key=day_key,
            event_time=event_time,
            reading=reading,
            payload_numeric=payload_numeric,
        )
    except Exception as error:
        _log_daily_agg_error(
            event_id=event.id,
            device_id=device_id,
            day_key=day_key,
            event_time=event_time,
            latest_ref=latest_ref,
            error=error,
        )

    print(
        "telemetria salva. "
        f"campos={len(payload_numeric)} "
        f"eventId={event.id} "
        f"deviceId={device_id} "
        f"savedWeekly={saved_weekly}"
    )
