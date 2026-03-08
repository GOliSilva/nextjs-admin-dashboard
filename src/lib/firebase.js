import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, onSnapshot, collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore"

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
const DEFAULT_DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID ?? "device-unknown"
const MAX_DOCS_PER_READ = 1000
const GRAPH_POLLING_INTERVAL_MS = 60 * 60 * 1000 // 1 hora em milissegundos
const HOUR_IN_MS = 60 * 60 * 1000

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
  const bucketCache = new Map()
  let lastFetchedBucketStartMs = null

  const publishPoints = () => {
    const startMs = toMillis(normalizedStart)
    const endMs = toMillis(normalizedEnd)
    const docs = Array.from(bucketCache.values())
    const points = extractPointsFromBuckets(docs, nameOfVariable, startMs, endMs)

    if (typeof callback === "function") {
      callback(points)
    }
  }

  const upsertBuckets = (docs) => {
    docs.forEach((docSnap) => {
      if (!docSnap?.id) {
        return
      }

      const data = docSnap.data?.() || {}
      bucketCache.set(docSnap.id, { id: docSnap.id, data })

      const bucketStartMs = toMillis(data.bucketStart)
      if (bucketStartMs != null && (lastFetchedBucketStartMs == null || bucketStartMs > lastFetchedBucketStartMs)) {
        lastFetchedBucketStartMs = bucketStartMs
      }
    })
  }

  const fetchInitialData = async () => {
    try {
      const dailyRef = collection(db, DEVICES_COLLECTION, resolveDeviceId(deviceId), DAILY_COLLECTION)
      const constraints = [
        orderBy("bucketStart", "desc"),
        limit(getBucketLimitForRange(normalizedStart, normalizedEnd)),
      ]

      if (normalizedStart) {
        constraints.push(where("bucketStart", ">=", normalizedStart))
      }

      if (normalizedEnd) {
        constraints.push(where("bucketStart", "<=", normalizedEnd))
      }

      const q = query(dailyRef, ...constraints)
      const snap = await getDocs(q)
      upsertBuckets(snap.docs)
      publishPoints()
    } catch (error) {
      console.error(error)
      if (typeof callback === "function") {
        callback([])
      }
    }
  }

  const fetchIncrementalData = async () => {
    try {
      const dailyRef = collection(db, DEVICES_COLLECTION, resolveDeviceId(deviceId), DAILY_COLLECTION)

      if (lastFetchedBucketStartMs == null) {
        await fetchInitialData()
        return
      }

      const deltaConstraints = [
        orderBy("bucketStart", "asc"),
        startAfter(new Date(lastFetchedBucketStartMs)),
        limit(MAX_DOCS_PER_READ),
      ]

      if (normalizedEnd) {
        deltaConstraints.push(where("bucketStart", "<=", normalizedEnd))
      }

      const deltaQuery = query(dailyRef, ...deltaConstraints)
      const deltaSnap = await getDocs(deltaQuery)
      upsertBuckets(deltaSnap.docs)

      // Refresh recent buckets: readings may still be appended around hour boundaries.
      const latestConstraints = [orderBy("bucketStart", "desc"), limit(2)]
      if (normalizedStart) {
        latestConstraints.push(where("bucketStart", ">=", normalizedStart))
      }
      if (normalizedEnd) {
        latestConstraints.push(where("bucketStart", "<=", normalizedEnd))
      }

      const latestQuery = query(dailyRef, ...latestConstraints)
      const latestSnap = await getDocs(latestQuery)
      upsertBuckets(latestSnap.docs)
      publishPoints()
    } catch (error) {
      console.error(error)
      if (typeof callback === "function") {
        callback([])
      }
    }
  }

  fetchInitialData()
  const intervalId = setInterval(fetchIncrementalData, GRAPH_POLLING_INTERVAL_MS)

  return () => clearInterval(intervalId)
}

export { app, auth, db, getMostRecentData, getDataForGraph }
