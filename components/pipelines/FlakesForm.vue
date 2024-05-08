<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';


const props = defineProps<{
    pipelineID: string | undefined
}>()

// 3.3+: alternative, more succinct syntax
const emit = defineEmits<{
    saveEdit: [flake: any] // named tuple syntax
}>()



const loading = ref(false);
const selected = ref([])

const editing = ref({});
const prevState = ref({});
const flakes = ref([]);

function startEdit(flake) {
    editing.value[flake.id] = true;
    prevState.value[flake.id] = { ...flake };
    flakes.value.push(flake);
}

function cancelEdit(flake, index) {
    editing.value[flake.id] = false;
}

async function saveEdit(flake) {
    editing.value[flake.id] = false;

    emit('saveEdit', flake)
}

async function deleteFlake(index) {
    flakes.value?.splice(index, 1);
}

function addFlake() {
    const newFlake = { url: '', id: uuidv4() };
    startEdit(newFlake);
}

</script>
<template>
    <UFormGroup name="flakes">

        <transition-group name="flake-list" tag="div" class="space-y-4 my-4">
            <div v-for="(flake, index) in flakes?.concat(selected)" :key="flake.id"
                class="rounded-lg flake-list-enter-active">
                <div v-if="editing[flake.id]">
                    <UTextarea :rows="1" v-model="flake.url" placeholder="github:Pix-build/quickstart" class="my-4 w-full" />
                    <div class="flex my-4">

                            <UButton @click="deleteFlake(index)" icon="i-heroicons-x-mark" variant="secondary">Delete
                            </UButton>

                            <UButton @click="saveEdit(flake)" icon="i-heroicons-check">Save</UButton>
                    </div>

                </div>
                <div v-else>

                    <div class="flex items-center justify-between">
                        <div class="flex-1 font-medium">{{ flake.url }}</div>
                        <div>
                            <UButton class="mr-2" variant="soft" size="2xs" icon="i-heroicons-pencil-square"
                                @click="startEdit(flake)" />
                            <UButton class="mr-2" color="red" variant="soft" size="2xs"
                                icon="i-heroicons-x-mark-20-solid" @click="deleteFlake(index)" />
                        </div>


                    </div>
                    <UDivider class="my-4" />
                </div>
            </div>
        </transition-group>
        <div class="flex items-center justify-between">
            <UButton @click="addFlake" icon="i-heroicons-plus" variant="secondary">Add New Flake</UButton>
        </div>

    </UFormGroup>
</template>
