<script setup lang="ts">
import type { Deployment, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const props = defineProps<{
    templateID: string | undefined
}>()

// 3.3+: alternative, more succinct syntax
const emit = defineEmits<{
    saveEdit: [file: any] // named tuple syntax
}>()



const { data: files, refresh: refreshFiles, pending: pendingFiles } = await useFetch<File[]>(`/api/files/template/${props.templateID}`)

console.log(files)


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

const editing = ref({});
const prevState = ref({});

function startEdit(file) {
    editing.value[file.id] = true;
    prevState.value[file.id] = { ...file };
}

function cancelEdit(file, index) {
    editing.value[file.id] = false;
    if (file.notInDb) {
        files.value = files.value?.splice(index, 1);
    } else {
        Object.assign(files[index], prevState.value[file.id]);
    }
}

async function saveEdit(file) {
    editing.value[file.id] = false;
    file.notInDb = false;
    // todo Implement saving logic here, e.g., API call
    // // post to /api/files
    if (props.templateID !== undefined) {
        await $fetch(`/api/files/template/${props.templateID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "file": file
            })
        })
        refreshFiles()
    }
    emit('saveEdit', file)
}

async function deleteFile(index) {
    await $fetch(`/api/files/${files.value[index].id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    files.value?.splice(index, 1);
    refreshFiles()
}

function addFile() {
    const newFile = { path: '', content: '', id: uuidv4(), notInDb: true };
    if (files.value == null) {
        files.value = [newFile]
    } else {
        files.value.push(newFile)
    }
    startEdit(newFile);
}

</script>
<template>
    <UFormGroup name="files">

        <!-- loading icon if pendingFiles -->

        <div v-if="pendingFiles" class="flex items center justify-center">
            <ULoadingIcon />
        </div>

        <transition-group name="file-list" tag="div" class="space-y-4 my-4">
            <div v-for="(file, index) in files?.concat(selected)" :key="file.id"
                class="rounded-lg file-list-enter-active">
                <div v-if="editing[file.id]">
                    <UTextarea :rows="1" v-model="file.path" placeholder="File System Path" class="my-4 w-full" />
                    <UTextarea resize v-model="file.content" placeholder="File Content" class="w-full my-4" />
                    <div class="flex justify-between  my-4">
                        <UButton @click="cancelEdit(file, index)" icon="i-heroicons-arrow-left" variant="secondary">
                            Cancel
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
                        <div class="flex-1 font-medium">
                        <UIcon name="i-heroicons-lock-closed" />

                        {{ file.path }}</div>
                        <div>
                            <UButton class="mr-2" color="red" variant="soft" size="2xs"
                                icon="i-heroicons-x-mark-20-solid" @click="deleteFile(index)" />
                        </div>


                    </div>
                    <UDivider class="my-4" />
                </div>
            </div>
        </transition-group>
        <div class="flex items-center justify-between">
            <UButton @click="addFile" icon="i-heroicons-plus" variant="secondary">Add New File</UButton>
        </div>

    </UFormGroup>
</template>
