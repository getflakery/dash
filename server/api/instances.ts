import type {  Instance } from "~/types"

const files: Instance[] = [
  {
    name: "example"
  },
  {
    name: "example"
  },  {
    name: "example"
  },  {
    name: "example"
  },  {
    name: "example"
  },
]

export default eventHandler(async () => {
  return files
})
