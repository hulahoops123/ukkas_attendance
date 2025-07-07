<template>
    <div v-if="props.isAuthenticated"
        class="font-raleway w-4/5 m-auto h-fit flex flex-col rounded-md ring-2 ring-blue-200 gap-2 pb-2 space-x-2 space-y-2 my-2 bg-neutral-100">
        <p class="text-2xl flex justify-center bg-amber-400 text-neutral-700">Admins Only 😉</p>
        <div class="grid grid-cols-4 font-bold ">
            <p>Code</p>
            <p>Unit</p>
            <p class="col-span-2">Description</p>
        </div>
        <div v-for="discipline in Object.keys(props.disciplines)" class="grid  grid-cols-4 ">
            <p>{{ discipline }}</p>
            <p>{{ props.disciplines[discipline].unit }}</p>
            <p class="col-span-2">{{ props.disciplines[discipline].description }}</p>
        </div>
        <form class="grid grid-cols-4 " @submit.prevent="checkNewDiscpline">
            <p class="font-normal col-span-4 text-xs mt-3 underline decoration-amber-600">add new discipline</p>
            <input type="text" v-model="newCode" placeholder="Code">
            <select v-model="newUnit">
                <option disabled selected value="">choose unit</option>
                <option value="time">time</option>
                <option value="distance">distance</option>
            </select>
            <input v-model="newDescription" class="col-span-2" type="text" placeholder="enter description">
            <button v-if="newCode && newUnit && newDescription" type="submit"
                class="col-span-4 flex justify-center bg-green-200 font-bold text-neutral-5"> save new</button>
        </form>
    </div>
</template>

<script setup>
const emits = defineEmits(['admin-changed'], 'himom');

const props = defineProps(["userData", "adminData", 'isAuthenticated', 'disciplines']);

const newCode = ref('');
const newUnit = ref('');
const newDescription = ref('');

function checkNewDiscpline() {
    if (newCode.value && newDescription.value && newUnit.value) {
        const newDiscipline = {
            [newCode.value]: {
                unit: newUnit.value,
                description: newDescription.value
            }
        }
        emits('admin-changed', newDiscipline);
        newCode.value = '';
        newUnit.value = '';
        newDescription.value = '';
    } 
}
</script>
<style scoped></style>