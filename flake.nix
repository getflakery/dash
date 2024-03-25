{
  description = "basic flake-utils";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";


  outputs = { self, nixpkgs, flake-utils, ... }:
    (flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
          devshell = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodePackages.pnpm
              nodePackages.yarn
              nodejs
              turso-cli
            ];
          };

        in
        {
          devShells.default = devshell;
        })
    );
}
