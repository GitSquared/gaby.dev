# Disclosure: Remote Code Injection in eDEX-UI 2.2.1 and below
date = 2019-05-19T19:20:53+02:00

On April 30th, 2019, a vulnerability was found in the source code of [eDEX-UI](https://github.com/GitSquared/edex-ui).

An incorrectly escaped API response in the `netstat` module, which pings a remote server to get geoip information about the current network, could lead to remote code injection in the renderer process (which is Node-enabled).

A fix for this vulnerability was pushed to `master` as soon as it was discovered, but a new version wasn't released immediately. Using this exploit required that the attacker could spoof a victim's DNS records and certificate storage to point `ipinfo.now.sh` to a fake API with a recognized SSL certificate. This was deemed hard enough to not necessitate an immediate release.

[eDEX-UI v2.2.2](https://github.com/GitSquared/edex-ui/releases/v2.2.2), released today, ships with a fix against this vulnerability, and the geoip API has been switched temporarily to another external, free service.

Starting Monday, May 20th, the `ipinfo.now.sh` service will cause older, vulnerable versions of eDEX to display a warning message prompting users to update to `v2.2.2` or above, by exploiting the vulnerability.

<p align="center">
  <br><br>
	<img alt="Warning message broadcast" style="box-shadow: 2px 2px 5px rgba(0,0,0,0.3);width:70%;" src="{{ URL }}/res/broadcast.png"/><br>
	<p style="text-align:center;font-size:0.9em;opacity:0.8;"><em>Warning message that will be broadcasted on vulnerable versions.</em></p><br>
</p>

As an open-source maintainer, ensuring the safety of the software I distribute is my number-one priority. This vulnerability was found thanks to the continuous integration services that are continuously scanning the code I push to GitHub.

If you have any questions or concerns, you can reach me by email at `gabriel (at) saillard.dev`.

-G
