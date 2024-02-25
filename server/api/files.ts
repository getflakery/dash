import type {  File } from "~/types"
import { useDB } from "../utils/db"

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
  const db = useDB()
  return files
})
