{
  description = "basic flake-utils";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.pnpm2nix.url = "github:nzbr/pnpm2nix-nzbr";


  outputs = { self, nixpkgs, flake-utils, pnpm2nix, ... }:
    (flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [
              pnpm2nix.overlays.default # Add the pnpm2nix overlay to provide mkPnpmPackage
            ];
          };
          devshell = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodePackages_latest.pnpm
              nodejs
            ];
          };
          # Example of how to use mkPnpmPackage to package a Node.js project using pnpm
          myNodeProject = pkgs.mkPnpmPackage {
            src = ./.; # Adjust this to the location of your Node.js project if it's not in the root
            extraBuildInputs = [
              pkgs.nodePackages.node-gyp
            ];
          };
        in
        {
          devShells.default = devshell;
          packages.default = myNodeProject;
        })
    );
}
