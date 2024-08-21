{
  description = "basic flake-utils";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.flakery.url = "github:getflakery/flakes";


  outputs = { self, nixpkgs, flake-utils, flakery, ... }:
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
              awscli2
              bun
              terraform
            ];
          };
        in
        {
          devShells.default = devshell;
        })


    );
}
