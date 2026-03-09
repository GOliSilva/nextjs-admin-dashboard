import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, onSnapshot, collection, query, where, orderBy, limit, getDocs, startAfter, doc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase config incompleto:", firebaseConfig)
  throw new Error("Firebase nao configurado - verifique o arquivo .env.local")
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const DEVICES_COLLECTION = "devices"
const DAILY_COLLECTION = "daily"
const STATE_COLLECTION = "state"
const DEFAULT_DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID ?? "device-unknown"
const MAX_DOCS_PER_READ = 1000
const GRAPH_POLLING_INTERVAL_MS = 60 * 60 * 1000 // 1 hora em milissegundos
const HOUR_IN_MS = 60 * 60 * 1000
const graphStreams = new Map()

function resolveDeviceId(deviceId) {
  const text = String(deviceId ?? "").trim()
  if (!text) {
    return DEFAULT_DEVICE_ID
  }

  const sanitized = text.replace(/[^A-Za-z0-9_-]/g, "")
  return sanitized || DEFAULT_DEVICE_ID
}

function normalizeStartOfDay(value) {
  if (!value) {
    return value
  }

  if (value instanceof Date) {
    const start = new Date(value)
    start.setHours(0, 0, 0, 0)
    return start
  }

  if (typeof value === "string" || typeof value === "number") {
    const start = new Date(value)
    if (!Number.isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0)
      return start
    }
  }

  if (value && typeof value.toDate === "function") {
    const start = value.toDate()
    start.setHours(0, 0, 0, 0)
    return start
  }

  return value
}

function normalizeEndOfDay(value) {
  if (!value) {
    return value
  }

  if (value instanceof Date) {
    const end = new Date(value)
    end.setHours(23, 59, 59, 999)
    return end
  }

  if (typeof value === "string" || typeof value === "number") {
    const end = new Date(value)
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999)
      return end
    }
  }

  if (value && typeof value.toDate === "function") {
    const end = value.toDate()
    end.setHours(23, 59, 59, 999)
    return end
  }

  return value
}

function toMillis(value) {
  if (!value) {
    return null
  }

  if (typeof value === "number") {
    return value
  }

  if (value instanceof Date) {
    const millis = value.getTime()
    return Number.isNaN(millis) ? null : millis
  }

  if (typeof value === "string") {
    const millis = new Date(value).getTime()
    return Number.isNaN(millis) ? null : millis
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis()
  }

  if (typeof value.toDate === "function") {
    const millis = value.toDate().getTime()
    return Number.isNaN(millis) ? null : millis
  }

  return null
}

function extractLatestReadingFromBucket(docSnap) {
  if (!docSnap) {
    return null
  }

  const data = docSnap.data() || {}
  const readings = Array.isArray(data.readings) ? data.readings : []
  if (readings.length === 0) {
    return null
  }

  const latestReading = readings.reduce((latest, current) => {
    const latestMs = toMillis(latest?.createdAt) ?? -1
    const currentMs = toMillis(current?.createdAt) ?? -1
    return currentMs > latestMs ? current : latest
  }, readings[0])

  const createdAtMs = toMillis(latestReading?.createdAt) ?? Date.now()
  return {
    id: `${docSnap.id}-${createdAtMs}`,
    ...latestReading,
    deviceId: data.deviceId,
  }
}

function getMostRecentData(callback, deviceId = DEFAULT_DEVICE_ID) {
  try {
    const dailyRef = collection(db, DEVICES_COLLECTION, resolveDeviceId(deviceId), DAILY_COLLECTION)
    const q = query(dailyRef, orderBy("bucketStart", "desc"), limit(1))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const latest = extractLatestReadingFromBucket(snap.docs[0])
        callback(latest)
      },
      (error) => {
        console.error(error)
        callback(null)
      },
    )

    return () => unsub()
  } catch (error) {
    console.error(error)
    callback(null)
    return () => {}
  }
}

function getLatestStateData(callback, deviceId = DEFAULT_DEVICE_ID) {
  try {
    const stateRef = doc(
      db,
      DEVICES_COLLECTION,
      resolveDeviceId(deviceId),
      STATE_COLLECTION,
      "latest",
    )

    const unsub = onSnapshot(
      stateRef,
      (snap) => {
        if (!snap.exists()) {
          callback(null)
          return
        }

        callback({
          id: snap.id,
          ...snap.data(),
        })
      },
      (error) => {
        console.error(error)
        callback(null)
      },
    )

    return () => unsub()
  } catch (error) {
    console.error(error)
    callback(null)
    return () => {}
  }
}

function extractPointsFromBuckets(docs, variableName, startMs, endMs) {
  const points = []

  docs.forEach((docSnap) => {
    const data =
      typeof docSnap?.data === "function"
        ? docSnap.data() || {}
        : docSnap?.data || {}
    const readings = Array.isArray(data.readings) ? data.readings : []

    readings.forEach((reading) => {
      const timestampMs = toMillis(reading?.createdAt)
      if (timestampMs == null) {
        return
      }

      if (startMs != null && timestampMs < startMs) {
        return
      }

      if (endMs != null && timestampMs > endMs) {
        return
      }

      const rawValue = reading?.[variableName]
      const numeric = typeof rawValue === "number" ? rawValue : Number.parseFloat(rawValue ?? "")

      points.push({
        x: timestampMs,
        y: Number.isFinite(numeric) ? numeric : 0,
      })
    })
  })

  return points.sort((a, b) => a.x - b.x)
}

function getBucketLimitForRange(startDate, endDate) {
  const startMs = toMillis(startDate)
  const endMs = toMillis(endDate)
  const safetyWindow = 4

  let estimatedBucketsByRange = 0
  if (startMs != null && endMs != null && endMs >= startMs) {
    estimatedBucketsByRange = Math.floor((endMs - startMs) / HOUR_IN_MS) + 1
  } else if (startMs != null) {
    const nowMs = Date.now()
    if (nowMs >= startMs) {
      estimatedBucketsByRange = Math.floor((nowMs - startMs) / HOUR_IN_MS) + 1
    }
  }

  if (estimatedBucketsByRange === 0) {
    estimatedBucketsByRange = 24
  }

  const estimatedBuckets = estimatedBucketsByRange
  const total = estimatedBuckets + safetyWindow

  return Math.max(1, Math.min(MAX_DOCS_PER_READ, total))
}

function getGraphStreamListenerCount(stream) {
  let count = 0
  stream.variableListeners.forEach((listeners) => {
    count += listeners.size
  })
  return count
}

function hasGraphStreamListeners(stream) {
  return getGraphStreamListenerCount(stream) > 0
}

function buildGraphStreamKey(resolvedDeviceId, normalizedStart, normalizedEnd) {
  const startMs = toMillis(normalizedStart)
  const endMs = toMillis(normalizedEnd)
  return `${resolvedDeviceId}|${startMs ?? "null"}|${endMs ?? "null"}`
}

function createGraphStream(resolvedDeviceId, normalizedStart, normalizedEnd) {
  return {
    resolvedDeviceId,
    normalizedStart,
    normalizedEnd,
    startMs: toMillis(normalizedStart),
    endMs: toMillis(normalizedEnd),
    dailyRef: collection(db, DEVICES_COLLECTION, resolvedDeviceId, DAILY_COLLECTION),
    bucketCache: new Map(),
    pointsCache: new Map(),
    variableListeners: new Map(),
    lastFetchedBucketStartMs: null,
    initialFetchPromise: null,
    incrementalFetchPromise: null,
    intervalId: null,
    destroyed: false,
  }
}

function notifyGraphStreamError(stream) {
  stream.variableListeners.forEach((listeners) => {
    listeners.forEach((listener) => {
      try {
        listener([])
      } catch (error) {
        console.error(error)
      }
    })
  })
}

function upsertGraphStreamBuckets(stream, docs) {
  let changed = false

  docs.forEach((docSnap) => {
    if (!docSnap?.id) {
      return
    }

    const data =
      typeof docSnap?.data === "function"
        ? docSnap.data() || {}
        : docSnap?.data || {}

    stream.bucketCache.set(docSnap.id, { id: docSnap.id, data })
    changed = true

    const bucketStartMs = toMillis(data.bucketStart)
    if (
      bucketStartMs != null &&
      (stream.lastFetchedBucketStartMs == null ||
        bucketStartMs > stream.lastFetchedBucketStartMs)
    ) {
      stream.lastFetchedBucketStartMs = bucketStartMs
    }
  })

  if (changed) {
    stream.pointsCache.clear()
  }

  return changed
}

function getGraphStreamPoints(stream, variableName) {
  if (stream.pointsCache.has(variableName)) {
    return stream.pointsCache.get(variableName)
  }

  const docs = Array.from(stream.bucketCache.values())
  const points = extractPointsFromBuckets(
    docs,
    variableName,
    stream.startMs,
    stream.endMs,
  )

  stream.pointsCache.set(variableName, points)
  return points
}

function publishGraphStreamVariable(stream, variableName) {
  const listeners = stream.variableListeners.get(variableName)
  if (!listeners || listeners.size === 0) {
    return
  }

  const points = getGraphStreamPoints(stream, variableName)
  listeners.forEach((listener) => {
    try {
      listener(points)
    } catch (error) {
      console.error(error)
    }
  })
}

function publishGraphStreamAll(stream) {
  stream.variableListeners.forEach((_listeners, variableName) => {
    publishGraphStreamVariable(stream, variableName)
  })
}

function runGraphStreamInitialFetch(stream) {
  if (stream.destroyed) {
    return Promise.resolve()
  }

  if (stream.initialFetchPromise) {
    return stream.initialFetchPromise
  }

  stream.initialFetchPromise = (async () => {
    try {
      const constraints = [
        orderBy("bucketStart", "desc"),
        limit(getBucketLimitForRange(stream.normalizedStart, stream.normalizedEnd)),
      ]

      if (stream.normalizedStart) {
        constraints.push(where("bucketStart", ">=", stream.normalizedStart))
      }

      if (stream.normalizedEnd) {
        constraints.push(where("bucketStart", "<=", stream.normalizedEnd))
      }

      const q = query(stream.dailyRef, ...constraints)
      const snap = await getDocs(q)

      if (stream.destroyed) {
        return
      }

      upsertGraphStreamBuckets(stream, snap.docs)
      publishGraphStreamAll(stream)
    } catch (error) {
      console.error(error)
      if (!stream.destroyed) {
        notifyGraphStreamError(stream)
      }
    } finally {
      stream.initialFetchPromise = null
    }
  })()

  return stream.initialFetchPromise
}

function runGraphStreamIncrementalFetch(stream) {
  if (stream.destroyed) {
    return Promise.resolve()
  }

  if (stream.incrementalFetchPromise) {
    return stream.incrementalFetchPromise
  }

  stream.incrementalFetchPromise = (async () => {
    try {
      if (stream.lastFetchedBucketStartMs == null) {
        await runGraphStreamInitialFetch(stream)
        return
      }

      const deltaConstraints = [
        orderBy("bucketStart", "asc"),
        startAfter(new Date(stream.lastFetchedBucketStartMs)),
        limit(MAX_DOCS_PER_READ),
      ]

      if (stream.normalizedEnd) {
        deltaConstraints.push(where("bucketStart", "<=", stream.normalizedEnd))
      }

      const deltaQuery = query(stream.dailyRef, ...deltaConstraints)
      const deltaSnap = await getDocs(deltaQuery)
      let hasChanges = upsertGraphStreamBuckets(stream, deltaSnap.docs)

      // Refresh recent buckets: readings may still be appended around hour boundaries.
      const latestConstraints = [orderBy("bucketStart", "desc"), limit(2)]
      if (stream.normalizedStart) {
        latestConstraints.push(where("bucketStart", ">=", stream.normalizedStart))
      }
      if (stream.normalizedEnd) {
        latestConstraints.push(where("bucketStart", "<=", stream.normalizedEnd))
      }

      const latestQuery = query(stream.dailyRef, ...latestConstraints)
      const latestSnap = await getDocs(latestQuery)
      hasChanges = upsertGraphStreamBuckets(stream, latestSnap.docs) || hasChanges

      if (!stream.destroyed && hasChanges) {
        publishGraphStreamAll(stream)
      }
    } catch (error) {
      console.error(error)
      if (!stream.destroyed) {
        notifyGraphStreamError(stream)
      }
    } finally {
      stream.incrementalFetchPromise = null
    }
  })()

  return stream.incrementalFetchPromise
}

function startGraphStream(stream) {
  if (stream.destroyed) {
    return
  }

  if (stream.intervalId != null) {
    return
  }

  runGraphStreamInitialFetch(stream)
  stream.intervalId = setInterval(() => {
    if (stream.destroyed || !hasGraphStreamListeners(stream)) {
      return
    }
    runGraphStreamIncrementalFetch(stream)
  }, GRAPH_POLLING_INTERVAL_MS)
}

function cleanupGraphStream(streamKey, stream) {
  if (stream.intervalId != null) {
    clearInterval(stream.intervalId)
    stream.intervalId = null
  }

  stream.destroyed = true
  stream.variableListeners.clear()
  stream.pointsCache.clear()
  stream.bucketCache.clear()
  graphStreams.delete(streamKey)
}

function subscribeGraphStreamVariable(streamKey, stream, variableName, callback) {
  if (typeof callback !== "function") {
    return () => {}
  }

  let listeners = stream.variableListeners.get(variableName)
  if (!listeners) {
    listeners = new Set()
    stream.variableListeners.set(variableName, listeners)
  }
  listeners.add(callback)

  if (stream.bucketCache.size > 0) {
    publishGraphStreamVariable(stream, variableName)
  }

  startGraphStream(stream)

  return () => {
    const currentListeners = stream.variableListeners.get(variableName)
    if (currentListeners) {
      currentListeners.delete(callback)
      if (currentListeners.size === 0) {
        stream.variableListeners.delete(variableName)
        stream.pointsCache.delete(variableName)
      }
    }

    if (!hasGraphStreamListeners(stream)) {
      cleanupGraphStream(streamKey, stream)
    }
  }
}

function getDataForGraph(
  nameOfVariable = "Va",
  dataInicial,
  dataFinal,
  _limitCount = 500,
  callback,
  deviceId = DEFAULT_DEVICE_ID,
) {
  void _limitCount

  const normalizedStart = normalizeStartOfDay(dataInicial)
  const normalizedEnd = normalizeEndOfDay(dataFinal)
  const resolvedDeviceId = resolveDeviceId(deviceId)
  const streamKey = buildGraphStreamKey(
    resolvedDeviceId,
    normalizedStart,
    normalizedEnd,
  )

  let stream = graphStreams.get(streamKey)
  if (!stream) {
    stream = createGraphStream(resolvedDeviceId, normalizedStart, normalizedEnd)
    graphStreams.set(streamKey, stream)
  }

  return subscribeGraphStreamVariable(
    streamKey,
    stream,
    nameOfVariable,
    callback,
  )
}

export { app, auth, db, getMostRecentData, getLatestStateData, getDataForGraph }
