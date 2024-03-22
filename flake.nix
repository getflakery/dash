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
              nodePackages.yarn
              nodejs
            ];
          };
          # Example of how to use mkPnpmPackage to package a Node.js project using pnpm
          yrnpkg = pkgs.mkYarnPackage rec {
            name = "app";
            src = ./.;
          };

          app = pkgs.stdenv.mkDerivation {
            name = "app";
            src = ./.;
            buildInputs = with pkgs; [ 
              yrnpkg
              nodePackages.yarn
              nodejs
            ];
            buildPhase = ''
              # symlink the node_modules to the app
              ln -s ${yrnpkg}/libexec/node_modules node_modules
              yarn run build
            '';

            installPhase = ''
              mkdir -p $out/dist
              mv .output/* $out/dist
            '';
            dontUnpack = true;
          };

        in
        {
          devShells.default = devshell;
          packages.default = app;
        })
    );
}
