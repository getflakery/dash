import { type Template } from "~/types"

const templates: Template[] = [
  {
    flakeUrl: "github:r33drichards/basic-flake",
  },
  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },  {
    flakeUrl: "github:r33drichards/basic-flake",
  },
]

export default eventHandler(async () => {
  return templates
})
