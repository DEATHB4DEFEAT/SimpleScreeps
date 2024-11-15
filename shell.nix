{ pkgs ? import <nixpkgs> {} }:

let
  	NPM_CONFIG_PREFIX = "./.npm";
in pkgs.mkShell {
	packages = with pkgs; [
		nodejs
		nodePackages.npm
	];

	inherit NPM_CONFIG_PREFIX;

	shellHook = ''
		export PATH="${NPM_CONFIG_PREFIX}/bin:$PATH"
	'';
}
