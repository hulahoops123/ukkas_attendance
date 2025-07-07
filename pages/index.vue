<template class="overflow-x-clip">
    <Head>
            <Title>HSQUAD PB</Title>
        </Head>
    <div class="wrapper z-0 absolute h-full w-full">
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
        <div><span class="dot"></span></div>
    </div>
    <div v-if="isAuthenticated" class="flex flex-col items-center overflow-scroll h-screen " ref="mainContainerElement">
        <div class="flex bg-blue-950/95 items-center z-50 w-full p-3">
            <img src="../assets/logo_crop.png" class="h-10 object-contain w-10 mr-2" alt="">
            
            <p class="text-4xl font-staatliches text-neutral-300 tracking-wider">hsquad PB<span
                    class="align-super ml-0.5 text-xs">s</span></p>
            <p v-if="isAdminUser" class="font-staatliches ring-1 bg-amber-600 text-neutral-600 ml-6 px-0.5 rounded-sm "
                @click="showAdminArea = !showAdminArea">admin</p>
            <p class="flex ml-auto underline decoration-pink-500  px-0.5 text-neutral-400" @click="logOut">
                logOut
            </p>
        </div>
        <div v-if="deferredPrompt" class="bg-pink-700 w-full text-neutral-200 flex z-50 justify-center items-center p-4 gap-2">
            <p class="text-lg font-bold">Add HSQUAD to homescreen?</p>
            <Icon name="line-md:circle-to-confirm-circle-transition" class="bg-green-800 h-12 w-12 rounded-full" @click="deferredPrompt.prompt()"></Icon>
            <Icon name="line-md:close-circle" class="bg-red-800 h-12 w-12 rounded-full" @click="deferredPrompt = null" ></Icon>
        </div>
        <div v-if="adminData"
            class="flex items-center justify-center text-neutral-300 w-full gap-2 bg-blue-950/95 sticky top-0 z-50 p-3">
            <Icon name="line-md:align-center" class="text-neutral-300 h-10 w-10 "></Icon>
            <select name="categories" id="categories" class="bg-transparent text-2xl font-raleway font-black"
                v-model="chosenSort" @change="triggerSort">
                <option selected value="userName">name</option>
                <option v-for="category in Object.keys(disciplines)" :value="category">{{ category }}</option>
            </select>
            <p class="flex w-full justify-start ml-4"> {{ chosenSort != 'userName' ? disciplines[chosenSort].description :
                '' }} </p>
        </div>
        <onClickOutside class="z-50" @trigger="showAdminArea = false">
            <AdminArea class="z-50" v-if="showAdminArea" :admin-data="adminData" :is-authenticated="isAuthenticated"
                :disciplines="disciplines" @admin-changed="newDisciplineAdded"></AdminArea>
        </onClickOutside>

        <div v-if="adminData && allUserData && !showAdminArea"
            class="relative flex w-full flex-col justify-center items-center pt-4">
            <onClickOutside v-if="showUserBubble" @trigger="closeUserBubble">
                <UserBubble
                    class="h-80 w-80 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50 transition-all bg-neutral-100"
                    @username-changed="userNameChanged" :disciplines="disciplines" :admin-data="adminData"
                    :user-data="userData" @input-changed="theInputChanged"></UserBubble>
            </onClickOutside>
            <div v-if="showUserBubble" class=" z-10 w-screen h-full backdrop-blur-sm bg-neutral-100/50 absolute"></div>
            <div v-for="(user, index) in allUserData">
                <onClickOutside @trigger="otherClickedUserId = ''">
                    <div v-if="user.userId == authenticatedUser.uid" ref="target" class="w-full h-0.5 bg-transparent"></div>
                    <AllUsersBubble
                        :class="user.userId == otherClickedUserId ? 'scale-150 my-24' : 'my-4', 
                            isScrolling && index % Math.floor(Math.random() * allUserData.length) ? 'translate-x-3 transition-all duration-1000' : '-translate-x-3 transition-all duration-1000',
                            isScrolling && index % Math.floor(Math.random() * allUserData.length) ? '-translate-y-6 transition-all duration-1000' : 'translate-y-6 transition-all duration-1000',
                            directions.top && index % Math.floor(Math.random() * allUserData.length) ? 'translate-y-3 transition-all duration-1000' : 'translate-x-4 transition-all duration-1000',
                            directions.top && index % Math.floor(Math.random() * allUserData.length) ? 'translate-y-4 transition-all duration-1000' : 'translate-x-3 transition-all duration-1000',
                            directions.bottom && index % Math.floor(Math.random() * allUserData.length) ? 'translate-y-3 transition-all duration-1000' : 'translate-x-4 transition-all duration-1000',
                            directions.bottom && index % Math.floor(Math.random() * allUserData.length) ? 'translate-y-4 transition-all duration-1000' : 'translate-x-3 transition-all duration-1000'"
                        class="transition-all h-48 w-48 " :id="user.userId" :disciplines="disciplines" :key="user.userId"
                        :user-data="user" :chosen-category="chosenSort"
                        @click="authenticatedUser.uid == user.userId ? showUserBubble = true : otherClickedUserId = user.userId">
                    </AllUsersBubble>
                </onClickOutside>
            </div>
            <img :src="userData.photoURL" referrerpolicy="no-referrer"
                :class="!showUserBubble && !targetIsVisible ? 'scale-100' : 'scale-0'" @click="scrollToElement"
                class="transition-all fixed right-5 top-[50%] w-12 text-stone-600 h-12 ring-2 rounded-full flex justify-center items-center" />
        </div>
    </div>
    <div v-else class="flex flex-col  justify-center items-center font-staatliches text-3xl z-50 absolute w-full h-full ">
            <img src="../assets/logo.png" class="drop-shadow-2xl animate-bubbleRise origin-bottom" alt="">
            <p class="text-8xl drop-shadow-md pb-20 font-staatliches text-neutral-300 tracking-tight">hsquad PB<span class="align-super ml-0.5 text-4xl">s</span></p>
            <div class="flex justify-center items-center bg-neutral-200 p-2 rounded-md shadow-md" @click="signIn">
                <p class="text-blue-700">Sign In with Google</p>
                <Icon name="logos:google-icon" class="w-8 ml-2 h-8" ></Icon>
            </div>
    </div>
</template>
<script setup>
import { GoogleAuthProvider, RecaptchaVerifier, getAuth, signInWithPopup, signOut, signInWithPhoneNumber } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection, deleteDoc, doc, getDoc, query, setDoc } from 'firebase/firestore';
import { OnClickOutside } from '@vueuse/components';
const { firestore, firebaseApp, auth } = useFirebase();
const { isAuthenticated, user: authenticatedUser } = useAuth(auth);

const signIn = () => signInWithPopup(auth, new GoogleAuthProvider());

const adminQuery = computed(() => authenticatedUser.value && collection(firestore, 'admin'));
const adminData = useFirestore(adminQuery, null);
const disciplines = computed(() => adminData.value.find(({ id }) => id === 'disciplines'));

const allUserQuery = computed(() => authenticatedUser.value && collection(firestore, 'users'));
const allUserData = useFirestore(allUserQuery, null);
const userData = computed(() => allUserData.value && allUserData.value.find(({ userId }) => userId === authenticatedUser.value.uid), null);


const mainContainerElement = ref(null);
const { x, y, isScrolling, arrivedState, directions } = useScroll(mainContainerElement);

const showUserBubble = ref(false);
const showAdminArea = ref(false);
const isAdminUser = computed(() => allUserData.value && userData.value.isAdmin, false);

const otherClickedUserId = ref(null);
const elementUserinAllUsers = computed(() => authenticatedUser.value.uid);


const target = ref(null)
const targetIsVisible = useElementVisibility(target);


const chosenSort = ref('userName');

const deferredPrompt = ref(null);
onMounted(() => {
    window.addEventListener('beforeinstallprompt', e => {
        console.log('heko');
        e.preventDefault();
        deferredPrompt.value = e;
    });
    window.addEventListener("appinstalled", () => {
        console.log('hello');
      deferredPrompt.value = null;
    });
});






const scrollToElement = () => {
    const el = document.getElementById(elementUserinAllUsers.value);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function closeUserBubble() {
    showUserBubble.value = false;
}

watchOnce(() => allUserData.value && adminData.value && chosenSort.value, () => triggerSort());

function triggerSort() {
    if (chosenSort.value == 'userName') {
        allUserData.value.sort((a, b) => {
            return a[chosenSort.value].localeCompare(b[chosenSort.value], undefined, { sensitivity: 'base' });
        });
    } else {
        allUserData.value.sort((a, b) => {
            if (a[chosenSort.value] > b[chosenSort.value]) { return 1; }
            if (a[chosenSort.value] < b[chosenSort.value]) { return -1; }
            return 0
        });
    }
}

async function newDisciplineAdded(newDiscpline) {
    const docRef = doc(firestore, 'admin', 'disciplines');
    useDebounce(async () => await setDoc(docRef, newDiscpline, { merge: true }), 500);
}


async function userNameChanged(newUserName) {
    const userRef = doc(firestore, 'users', authenticatedUser.value.uid);
    useDebounce(async () => await setDoc(userRef, { userName: newUserName }, { merge: true }).then(() => {
        chosenSort.value = 'userName';
        triggerSort();
    }).finally(() => scrollToElement()), 250);
}

async function theInputChanged(newNumber, category) {
    const userRef = doc(firestore, 'users', authenticatedUser.value.uid);
    useDebounce(async () => await setDoc(userRef, { [category]: newNumber }, { merge: true }).then(() => {
        chosenSort.value = category;
        triggerSort();
    }).finally(() => scrollToElement()), 250);
}

async function deleteMulti() {
    console.log('hi dad');
    allUserData.value.forEach(async element => {
        if (element.userName != 'jono') {
            const docRef = doc(firestore, 'users', element.userId);
            await deleteDoc(docRef).then(() => console.log('deleted')).catch((error => console.log(error)));

        } else {
            console.log(element.userName);
        }
    });
}
async function createMulti() {
    for (let index = 0; index < 5; index++) {
        const { data } = await useFetch(() => 'https://randomuser.me/api/');
        let newProfile = {
            userId: data.value.results[0].login.uuid,
            userName: data.value.results[0].name.first,
            photoURL: data.value.results[0].picture.thumbnail,
            email: data.value.results[0].email,
            DNF: Math.floor(Math.random() * 110),
            DYN: Math.floor(Math.random() * 150),
            ['16X']: Math.floor(Math.random() * 50) + 14 + ':' + Math.floor(Math.random() * 59),
            STA: Math.floor(Math.random() * 10) + ':' + Math.floor(Math.random() * 59),
        }
        console.log(newProfile);
        function formatTime(mmss, category) {
            let mm = mmss.split(':')[0];
            let ss = mmss.split(':')[1];
            if (mm.length == 1) mm = '0' + mm;
            if (ss.length == 1) ss = '0' + ss;
            // emits('input-changed',mm+':'+ss, category);
            newProfile[category] = mm + ':' + ss;
        }
        formatTime(newProfile['16X'], '16X');
        formatTime(newProfile.STA, 'STA');

        const userRef = doc(firestore, 'users', data.value.results[0].login.uuid);
        await setDoc(userRef, newProfile);
    }
}

watch(isAuthenticated, async () => {
    //if the user is autenticated try to get their userprofile from firestore
    if (isAuthenticated.value === true) {
        const userRef = doc(firestore, 'users', authenticatedUser.value.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            console.log('document does not exist');
            await setDoc(userRef, {
                userId: authenticatedUser.value.uid,
                userName: authenticatedUser.value.displayName,
                photoURL: authenticatedUser.value.photoURL,
                email: authenticatedUser.value.email
            });
        }
    }
})

const logOut = () => {
    signOut(auth).catch((err) => {
        console.error(err);
    });
};

</script>

<style>
.wrapper {
    background: linear-gradient(180deg, #04fafd, 5%, #119dff, 50%, #030423);
}

.wrapper div {
    height: 60px;
    width: 60px;
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 50px;
    position: absolute;
    top: 10%;
    left: 10%;
    animation: 4s linear infinite;
}

div .dot {
    height: 10px;
    width: 10px;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.5);
    position: absolute;
    top: 20%;
    right: 20%;
}

.wrapper div:nth-child(1) {
    top: 20%;
    left: 20%;
    animation: animate 8s linear infinite;
}

.wrapper div:nth-child(2) {
    top: 60%;
    left: 80%;
    animation: animate 10s linear infinite;
}

.wrapper div:nth-child(3) {
    top: 40%;
    left: 40%;
    animation: animate 3s linear infinite;
}

.wrapper div:nth-child(4) {
    top: 66%;
    left: 30%;
    animation: animate 7s linear infinite;
}

.wrapper div:nth-child(5) {
    top: 90%;
    left: 10%;
    animation: animate 9s linear infinite;
}

.wrapper div:nth-child(6) {
    top: 30%;
    left: 60%;
    animation: animate 5s linear infinite;
}

.wrapper div:nth-child(7) {
    top: 70%;
    left: 20%;
    animation: animate 8s linear infinite;
}

.wrapper div:nth-child(8) {
    top: 75%;
    left: 60%;
    animation: animate 10s linear infinite;
}

.wrapper div:nth-child(9) {
    top: 50%;
    left: 50%;
    animation: animate 6s linear infinite;
}

.wrapper div:nth-child(10) {
    top: 45%;
    left: 20%;
    animation: animate 10s linear infinite;
}

.wrapper div:nth-child(11) {
    top: 10%;
    left: 90%;
    animation: animate 9s linear infinite;
}

.wrapper div:nth-child(12) {
    top: 20%;
    left: 70%;
    animation: animate 7s linear infinite;
}

.wrapper div:nth-child(13) {
    top: 20%;
    left: 20%;
    animation: animate 8s linear infinite;
}

.wrapper div:nth-child(14) {
    top: 60%;
    left: 5%;
    animation: animate 6s linear infinite;
}

.wrapper div:nth-child(15) {
    top: 90%;
    left: 80%;
    animation: animate 9s linear infinite;
}

@keyframes animate {
    0% {
        transform: scale(0) translateY(0) rotate(70deg);
    }

    100% {
        transform: scale(1.3) translateY(-100px) rotate(360deg);
    }
}</style>