import type {  Networking } from "~/types"

const files: Networking[] = [
  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },
  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },  {
    domain: "foo.app.flakery.xyz",
    ip: "33.33.33.33"
  },
]

export default eventHandler(async () => {
  return files
})
