import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore,onSnapshot,  collection, query, where,orderBy,  limit,  getDocs,addDoc,doc} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Debug: verifica se as variáveis de ambiente estão carregadas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("⚠️ Firebase config incompleto:", firebaseConfig)
  throw new Error("Firebase não configurado - verifique o arquivo .env.local")
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)
function getMostRecentData(callback) {
  try {
    const q = query(collection(db, "dadosEnergia"), orderBy("createdAt", "desc"), limit(1));

    const unsub = onSnapshot(q, (snap) => {
      console.log("🔥 Snapshot recebido, docs:", snap.docs.length);
      const doc = snap.docs[0];
      const latest = doc ? { id: doc.id, ...doc.data() } : null;
      console.log("📊 Dados mais recentes:", latest);
      callback(latest);
    }, (error) => {
      console.error("❌ Erro no onSnapshot:", error);
    });

    // Retorna a função de unsubscribe para poder parar de ouvir
    return unsub;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
function getDataForGraph(
  nameOfVariable = "Va",
  dataInicial,
  dataFinal,
  limitCount = 500,
  callback,
) {
  const fetchData = async () => {
    try {
      const constraints = [orderBy("createdAt", "desc"), limit(limitCount)];

      if (dataInicial) {
        constraints.push(where("createdAt", ">=", dataInicial));
      }

      if (dataFinal) {
        constraints.push(where("createdAt", "<=", dataFinal));
      }

      const q = query(collection(db, "dadosEnergia"), ...constraints);
      const snap = await getDocs(q);
      const points = snap.docs
        .map((docSnap) => {
          const data = docSnap.data() || {};
          const rawValue = data[nameOfVariable];
          const numeric =
            typeof rawValue === "number"
              ? rawValue
              : Number.parseFloat(rawValue ?? "");
          const createdAt = data.createdAt;
          const x =
            createdAt && typeof createdAt.toDate === "function"
              ? createdAt.toDate()
              : createdAt;

          return {
            x,
            y: Number.isFinite(numeric) ? numeric : 0,
          };
        })
        .reverse();

      if (typeof callback === "function") {
        callback(points);
      }
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
  const intervalId = setInterval(fetchData, 60000);

  return () => clearInterval(intervalId);
}
export { app, auth, db, getMostRecentData,getDataForGraph }
