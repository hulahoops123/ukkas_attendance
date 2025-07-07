<template>
    <div class="flex flex-col ring-2 rounded-full  px-4 pb-2  items-center">
        <img :src="props.userData.photoURL" class="rounded-full my-2 w-20 h-20" alt="" referrerpolicy="no-referrer">
            <!-- <p @click="showUserNameInput=true" v-if="!showUserNameInput" class="  text-2xl font-raleway font-bold my-2 text-gray-700 relative ">{{ props.userData.userName }}</p> -->
            <input @click="newUserNameError = false" @change="checkUserName($event.target.value)" class="flex justify-center text-center  text-2xl font-raleway font-bold my-2 text-gray-700 bg-transparent rounded-md " :value="props.userData.userName" type="text">
            <p v-if="newUserNameError" class="text-xs">too short! 🙅</p>
        <div v-for="category in Object.keys(props.disciplines)" class="grid space-x-6 mr-4 space-y-2 grid-cols-3 w-2/3 items-center">
            <p class=" font-staatliches text-2xl text-neutral-500 h-full w-full flex items-end justify-end   ">{{ category }}</p>
            <input v-if="props.disciplines[category].unit === 'distance'"
                @input="emits('input-changed', $event.target.value, category)" type="number" min="0" max="99"
                inputmode="numeric" class=" font-staatliches text-2xl placeholder-blue-600 text-purple-800 bg-transparent h-full flex text-center justify-center"
                :placeholder="props.userData[category] ? props.userData[category] : '-'">
            <div v-else class="flex justify-center   h-full">
                <input
                    @input="formatTime($event.target.value + ':' + (props.userData[category] ? (props.userData[category].split(':')[1]) : 0), category)"
                    type="number" min="0" max="50" inputmode="numeric"
                    class="font-staatliches text-2xl placeholder-blue-600 text-purple-800 bg-transparent h-full flex text-end justify-center "
                    :placeholder="props.userData[category] ? (props.userData[category]).split(':')[0] : '-'">
                <p class="font-raleway h-full flex items-center text-xl font-bold text-neutral-400 px-1">:</p>
                <input
                    @input="formatTime((props.userData[category] ? (props.userData[category].split(':')[0]) : 0) + ':' + $event.target.value, category)"
                    type="number" min="0" max="59" inputmode="numeric"
                    class=" font-staatliches text-2xl placeholder-blue-600 text-purple-800 bg-transparent h-full flex text-start justify-center"
                    :placeholder="props.userData[category] ? (props.userData[category]).split(':')[1] : '-'">
            </div>
            <p v-if="props.disciplines[category].unit === 'distance'" class="text-xs   font-raleway text-neutral-400 -mr-6 ">
                metres</p>
            <p v-else class="text-xs   font-raleway text-neutral-400 -mr-6">mm:ss</p>
        </div>
    </div>
</template>
<script setup>
const newUserNameError = ref(false);
const emits = defineEmits(['input-changed', 'username-changed'], 'himom');
const props = defineProps(["userData", "adminData", "disciplines"]);
function checkUserName(newUserName){
    if (newUserName == props.userData.userName) return;
    if (newUserName.length < 4) {newUserNameError.value = true; return};
    emits('username-changed',newUserName);
    console.log('change username now');
}
function formatTime(mmss,category){
    let mm = mmss.split(':')[0];
    let ss = mmss.split(':')[1];
    if(mm.length == 1) mm = '0'+mm;
    if(ss.length == 1) ss = '0'+ss;
    emits('input-changed',mm+':'+ss, category);
}
</script>
<style></style>