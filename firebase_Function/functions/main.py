

import ast
import json
from datetime import datetime, timezone

from firebase_functions import pubsub_fn
from firebase_functions.options import set_global_options
from firebase_admin import firestore, initialize_app

set_global_options(max_instances=10)

initialize_app()
_db = None
ALLOWED_FIELDS = {
    "Va", #tensão de fase A
    "Vb", #tensão de fase B
    "Vc", #tensão de fase C
    "Ia", #corrente de fase A
    "Ib", #corrente de fase B
    "Ic",#corrente de fase C
    "In",#corrente neutro
    "angVa", #ângulo de fase A
    "angVb",#ângulo de fase B
    "angVc", #ângulo de fase C
    "angIa", #ângulo de fase A
    "angIb",#ângulo de fase B
    "angIc",#ângulo de fase C
    "Pdir",#potência ativa total
    "Prev",#potência reativa total
    "Q",#potência aparente total
    "S", #potência total
    "Ph",#fator de potência total
    "fpa", #fator de potência de fase A
    "fpb",#fator de potência de fase B
    "fpc",#fator de potência de fase C
    "fpt",#fator de potência total
    "f",#frequencia
    "t",#temperatura
    "Pa",#potência ativa de fase A
    "Pb",#potência ativa de fase B
    "Pc",#potência ativa de fase C
    "Ea",#energia ativa de fase A
    "Eb",#energia ativa de fase B
    "Ec",#energia ativa de fase C
}


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


def _parse_payload(raw_payload):
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
            # Aceita payload serializado como dicionario Python (aspas simples)
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

    # Quando a mensagem vier de Cloud Logging, os dados uteis ficam em textPayload.
    if "textPayload" in parsed:
        inner = _parse_payload(parsed.get("textPayload"))
        if isinstance(inner, dict):
            return inner

    # Alguns publishers usam jsonPayload.
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


@pubsub_fn.on_message_published(topic="rawData")
def on_raw_data(event: pubsub_fn.CloudEvent[pubsub_fn.MessagePublishedData]):

    raw_payload = event.data.message.json
    if raw_payload is None:
        raw_payload = event.data.message.data

    measurements = _extract_measurements(raw_payload)
    payload = _only_numeric_fields(_coerce_numbers(measurements))

    if not payload:
        print(f"rawData ignorado: sem campos numericos. eventId={event.id}")
        return

    doc_data = {
        **payload,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }

    db = _get_db()
    db.collection("dadosEnergia").add(doc_data)

    saved_weekly = False
    if _should_save_weekly(getattr(event, "time", None)):
        weekly_doc_data = {
            **payload,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        db.collection("dadosEnergiaSemanal").add(weekly_doc_data)
        saved_weekly = True

    print(
        "dadosEnergia salvo. "
        f"campos={len(payload)} "
        f"eventId={event.id} "
        f"savedWeekly={saved_weekly}"
    )
