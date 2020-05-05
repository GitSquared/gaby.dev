# Thoughts on working with beginners
date: 2020-05-05T10:00:00.000Z

Since last October, motivated by the success of some of my open-source projects and my passion for software, I've started a 5-year program in a french private graduate school (HETIC).

It is one of those "digital expert" things where you get courses on lightweight software engineering, marketing and design with even a light touch of politics, the goal being to make competent project leaders and entrepreneurs who can understand all of the aspects of a modern SaaS product.

This has given me a strange but very insightful opportunity: to work on software projects with absolute beginners.

Here is my advice to get a project delivered in such a way that **everyone will learn from the experience** and **make friends, not ennemies**, in the process. 
It is intended for both parts of such a relationship.

## Don't be too ambitious.
Let's keep this real. On a small enough scale, increasing the number of developers exponentially increases the time needed to achieve the project.
Even more so when at least one of them is a beginner.

**As a skilled developper, you will have to set the goals & ambitions for the project**. A good way to set those goals is to think about what you could build in *half* the time you have before the deadline.

Try to think only in features, not technical implementations: beginners need to learn the language before you start talking to them about frameworks and stacks and good continuous delivery practices. Go as barebone as possible.

**As a beginner,** don't look at some of your more skilled peer's latest projects and think that this is what you'll build because they will teach you everything in the process. It just won't happen, for a simple reason:

## Teaching is hard.
I can't stress this enough. There is a ***very large*** gap between knowing something and being able to teach it in a clear, understandable manner.

Chances are both of you will lose hope at some point, but **don't stop trying** because it is the most interesting and insightful part of the experience, for both parties involved.

Ideally, if you can afford it, you should try letting the beginner write as much of the code as possible, while the skilled dev looks over his/her shoulder, only suggesting overrall structure, logic and bug fixes.

One thing you should keep in mind when doing this, as the "teacher", is to try and let your "student" guess what you would tell them.

## Make it a guessing game.
For instance, if something is not working, give a first clue pointing to the right part of the code, like so:
_"I think something is wrong at line X. Do you see it?"_

If that isn't enough, go deeper in details, possibly explaining the problem but **not the solution**:
_"Your 'for' loop is flawed because it does more loops than there are elements in your array."_

Finally, explain the problem **in depth** and propose one or more solutions, with as much explanations as you can:
_"You've initiated the control variable 'i' at 0 and told the loop go on while 'i' is less than 6, which is the size of your array. But because you start at 0, you will actually loop 7 times. You can either lower your loop condition or start the control variable at 1."_

You should encourage "trying stuff" as much as possible: if you know the code on the screen will not compile, let the beginner try anyway and be confronted with the error message.

If you're writing entirely new stuff, start by going over what the program *should do* (think input/output), and then gradually suggest how it could do it.
Wait for something to work before suggesting optimizations or cleaner ways of writing it.

**This requires focus and patience on both ends.** But eventually, you'll find that it is a very effective method that you can apply to both fixing existing problems and writing entirely new code.

## Keep motivation strong.
Most of the time I've found that motivation starts degrading around the end of a project, when everyone is having headaches on deep code problems and the bigger picture sort of fades away.

In those moments, don't hesitate to take a break, look over what you've already done, and pat yourself on the back. Take an evening off and go grab a beer or something. We're only human.

If you're the beginner and you're starting to lose hope because your peer is *so damned good at this*, keep in mind that **because your mentor started learning years before you did does not mean you suck at this**.
Most likely you're actually pretty damn good if you can follow along.

If anything, you should be *pissed* that anybody has more skills than you do, and you should strive to get even better than them. Because guess what, you got the guts and brains to do that, too!

## Things not to forget...
Everyone does not share the same *ethos* regarding software programming, but I'll recommend that you remember the following:

1. **Code is a means to an end.**
  Outside the (very small) bubble of people who will read and/or work with your codebase, ***no one gives a shit*** about code.
  What matters is the end result: the product, tool or demo you're building.
  
2. **Clean code will keep you from going insane.**
  If you can't read it in 3 years and understand most of it, you're doing it wrong.
  
3. **Optimization comes with scale.**
  There is no need to over-optimize everything from the beginning. Optimization will make your code harder to understand and make it more difficult to refactor large part of the architecture itself.
  You should only try to avoid common pitfalls, and leave most of the optimization problem for when it'll actually start to look like a problem.
  
4. **You are not a robot.**
  If you're struggling too much, just take a pause. Writing software demands focus, motivation, and a well-rested mind. It's kind of like yoga.

Good luck, and don't forget to have fun.
