<template>
<div class="flex flex-col ring-2 rounded-full bg-neutral-600 justify-center align-middle relative  items-center">
    <img :src="props.userData.photoURL" class="rounded-full h-12 absolute -top-4 w-12 bg-cover" alt="" referrerpolicy="no-referrer">
    <p class="text-md font-raleway font-bold flex  text-blue-700 bg-neutral-100 shadow-lg ring-1 rounded-md p-0.5 ">{{ props.userData.userName }}</p>
    <div v-for="category in Object.keys(props.disciplines)" class="grid grid-cols-2 border-black bordr w-2/3">
        <p :class="category != props.chosenCategory ? '' : 'underline'" class="flex justify-center font-staatliches text-xl text-neutral-300">{{ category }}</p>
        <p :class="category != props.chosenCategory ? 'text-xl' : 'text-2xl'"  class="w-12 text-center font-staatliches text-purple-200"> {{props.userData[category] ? props.userData[category] : '-'}}</p>
    </div>
</div>
</template>

<script setup>
const props = defineProps(["userData", "disciplines", 'chosenCategory']);
</script>

<style>

</style>