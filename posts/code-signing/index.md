# Code Signing & why it (currently) sucks
date: 2018-12-28T14:55:36+01:00

**tl;dr: Desktop software signing is like SSL used to be not so long ago: both extremely interesting for end-users and developers alike, but too expensive for anyone not running a business.**

--- 

Earlier today, I was looking at the issues left on [eDEX-UI](https://github.com/GitSquared/edex-ui), and decided to work on [#278](https://github.com/GitSquared/edex-ui/issues/278) - "Implementing an internal self-update mechanism".

After a bit of thinking and research, I ended up dropping the idea, even though it would in theory be easy to implement: there is the nice, built-in Electron [autoUpdate](https://electronjs.org/docs/api/auto-updater) API, but I'd need to code-sign the releases first, and while there is also the [electron-builder way](https://www.electron.build/auto-update) that does not require signing, I just don't feel that the added security risks are worth it.

A little background explanation: Code-signing is a process by which a developer use certified cryptographic keys to digitally sign binaries before shipping software to end-users. The OS verifies that the signature is valid before installing/running the software, and it ensures that the code hasn't been messed with between the original release and the version downloaded by the user.

The whole thing drastically improves security, especially in context of self-updating apps that may be susceptible to mitm/fake server attacks; you may wonder why it hasn't been implemented on eDEX yet - indeed, when you try to install it on either macOS or Windows, you are prompted with a warning pop-up telling you that you're trying to install unverified software published by an unknown developer (that would be me).

<p align="center">
	<img alt="macOS warning popup for unsigned apps" src="{{ URL }}/res/macOS-popup.png"/>
</p>

Well, the "problem" is, to get a certified key to sign your code with, you need to grab your wallet. Apple has the all-included [Apple Developer Program](https://developer.apple.com/programs), which costs **99 US$/year**. Think that's bad? It's really not.

In the Microsoft world - and keep in mind [Windows has >80% of the market shares in desktop OSs](https://en.wikipedia.org/wiki/Usage_share_of_operating_systems#Desktop_and_laptop_computers) (sadly) - certificates have to be obtained through external providers like [Digicert](https://www.digicert.com/code-signing/microsoft-authenticode.htm), for instance, who will happily provide you with nothing more than the certificate at the wonderful cost of "just" **474 US$/year**.

Now, as a young student maintaining a piece of free and open-source software that has got 30 000 downloads in less than a month, I'm not exactly swimming in money right now - there's an operating cost, both in server fees and valuable time, not that I'm complaining but hey. So 500$ a year for signing builds is a big no. I'd like to eat something else than ramen noodles first, thank you.

You might think that I'm a cheap bastard and that 500 bucks a year isn't all that much to have a few companies verify my identity and allow me to publish software to a global audience of a billion user. And to some extent, you'll be right.

But here's why I personnally think the code-signing system is broken: ***code-signing is a valuable security feature, and by putting it behind paywalls, small applications like eDEX are (voluntarily) made more dangerous to use.***

If you were hosting websites a few years back, you might remember that even for small ones, if you wanted to provide your users with HTTPS encryption - which is by now pretty much a requirement for any website that doesn't want to [get flagged by browsers](https://www.theregister.co.uk/2018/02/08/google_chrome_http_shame/) - you had to buy an SSL certificate and those used to be crazy expensive,  hundreds a year for the basic stuff with no identity verification.

<p align="center">
	<img alt="Letsencrypt logo" src="{{ URL }}/res/Letsencrypt.png"/>
</p>

Then, in 2016, [letsencrypt](https://letsencrypt.org) came along. Suddenly, basic SSL certificates were free, and everyone started implementing HTTPS if they hadn't done so already. **No need to say that the World Wide Web is a much safer place since then.**

So perhaps one day we'll have the letsencrypt of code-signing and desktop software will be safer for everyone. Until then, I'll have to keep shipping unsigned binary releases.
