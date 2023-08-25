---
layout: post
title: "Networking with Unifi"
description: "I put a rack mounted switch into my apartment"
tags: []
---

As one of my side projects, I wanted to get serious about my network. I went a little overboard but throughly enjoyed the process. The project initially started with one goal: get 5 GHz WiFi 6 in every room.

![](/images/networking/IMG_0371.webp)

So the first thing I purchased right off the bat was the Unifi Dream Machine SE (UDM SE). This includes 2 PoE+ and 6 PoE switch ports at 1 Gbps.

Attached to the ports are 4 access points in each of my apartment's rooms. You ask, why do you need so many? It's because most of my walls are cement and in NYC, 5 GHz really only works well with line of sight. Those 4 access points consist fo 2x U6 In-Wall and 2x U6 Professional. I personally wish I went with all In-Walls since my aparment is pre-wired and doesn't have any ceiling mounts. You live and you learn.

Next up, making it look nice. I could have purchased a rack but it would take quite a bit of space either above or below the closet, so instead I decided to use a StarTech 1U Vertical Wall mount. That way it can remain flush with the wall and keep a lot of usable space.

![](/images/networking/IMG_0426.webp)

After some additional devices, I quickly needed to add additional ports. To do so, I decided to add the Unifi Enterprise 24 PoE which has PoE+ on all ports and 12 2.5 GbE. To get it hooked up with the UDM SE, there is a 10 Gbps SFP+ DAC cable connecting them together.

![](/images/networking/IMG_0628.webp)

With that, the networking project is complete and there are enough ports to expand to build a home lab very soon.

P.S. An added extra benefit with Unifi: cameras record locally onto the UDM SE.