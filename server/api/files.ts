import type {  File } from "~/types"

const files: File[] = [
  {
    content: "/foo",
    path: "/foo"
  },
  {
    content: "/foo",
    path: "/bar"
  },
  {
    content: "/foo",
    path: "/tsauth"
  },
  {
    content: "/foo",
    path: "/.env"
  },
]

export default eventHandler(async () => {
  return files
})
