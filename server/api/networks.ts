import type {  Network } from "~/types"

const files: Network[] = [
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
