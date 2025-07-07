import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const useFirebase = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCCLvsEiQXipaePuDTKnuPDmLY9C32_LYQ",
        authDomain: "hapnea-655a7.firebaseapp.com",
        projectId: "hapnea-655a7",
        storageBucket: "hapnea-655a7.appspot.com",
        messagingSenderId: "259649046261",
        appId: "1:259649046261:web:18ff6b47b3e34bd607e7bc"
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return {
        firebaseApp,
        firestore,
        auth
    }
}