<template>
    <div class="flex items-center justify-between">

        <USelectMenu v-model="selected" :loading="loading" :searchable="search" placeholder="Search for a file by path"
            option-attribute="path" multiple trailing by="id" />

        <UButton @click="addFile" icon="i-heroicons-plus" variant="secondary">Add New File</UButton>

    </div>




    <transition-group name="file-list" tag="div" class="space-y-4 my-4">
        <div v-for="(file, index) in files.concat(selected)" :key="file.id" class="rounded-lg file-list-enter-active">
            <div v-if="editing[file.id]">
                <UTextarea :rows="1" v-model="file.path" placeholder="File System Path" class="my-4 w-full" />
                <UTextarea resize v-model="file.content" placeholder="File Content" class="w-full my-4" />
                <div class="flex justify-between  my-4">
                    <UButton @click="cancelEdit(file, index)" icon="i-heroicons-arrow-left" variant="secondary">Cancel
                        Editing</UButton>
                    <div>
                        <UButton @click="deleteFile(index)" icon="i-heroicons-x-mark" variant="secondary">Delete
                        </UButton>
                        <UButton @click="saveEdit(file)" icon="i-heroicons-check">Save</UButton>
                    </div>
                </div>
            </div>
            <div v-else>

                <div class="flex items-center justify-between">
                    <div class="flex-1 font-medium">{{ file.path }}</div>
                    <div>
                        <UButton class="mr-2" variant="soft" size="2xs" icon="i-heroicons-pencil-square"
                            @click="startEdit(file)" />
                        <UButton class="mr-2" color="red" variant="soft" size="2xs" icon="i-heroicons-x-mark-20-solid"
                            @click="deleteFile(index)" />
                    </div>


                </div>
                <UDivider class="my-4" />


            </div>
        </div>
    </transition-group>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const files = reactive([]);
const editing = ref({});
const prevState = ref({});

function startEdit(file) {
    editing.value[file.id] = true;
    prevState.value[file.id] = { ...file };
}

function cancelEdit(file, index) {
    editing.value[file.id] = false;
    if (file.notInDb) {
        files.splice(index, 1);
    } else {
        Object.assign(files[index], prevState.value[file.id]);
    }
}

function saveEdit(file) {
    editing.value[file.id] = false;
    file.notInDb = false;
    // Implement saving logic here, e.g., API call
}

function deleteFile(index) {
    files.splice(index, 1);
    // Optionally, handle backend deletion here
}

function addFile() {
    const newFile = { path: '', content: '', id: uuidv4(), notInDb: true };
    files.push(newFile);
    startEdit(newFile);
}

const loading = ref(false);
const selected = ref([])


async function search(q: string) {
    loading.value = true

    let files = await $fetch('/api/files');

    loading.value = false

    return files.filter((file) => {
        return file.path.toLowerCase().includes(q.toLowerCase())
    })
}

</script>

<style scoped>
.file-list-enter-active,
.file-list-leave-active,
.file-list-move {
    transition: all 0.5s ease;
}

.file-list-enter,
.file-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
