# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.




insert Model {
  title := "Keychain",
  description := "Kyechain for cool guys",
  iterations := {
    (insert ModelIteration { number := 1, code := "cube(15)" }),
    (insert ModelIteration { number := 2, code := "Text = \"Gratuluji!\";
Width = 80;
Height = 20;
Depth = 2;
TextDepth = 2;
HoleDiameter = 5;

union() {
    cube([Width, Height, Depth]);
    translate([0, Height / 2, Depth])
        linear_extrude(TextDepth, convexity = 4)
            resize([Width-5, 0], auto = true)
                text(Text, valign = \"center\");
    translate([-Height, 0, 0])
        difference() {
            cube([Height, Height, Depth]);
            translate([Height/2, Height/2, -0.5])
                cylinder(r = HoleDiameter, h = Depth+1);
            difference() {
                cube([Height/2, Height, Depth]);
                translate([Height / 2, Height/2, 0])
                    cylinder(d = Height, h = Depth);
            }
        }
}

" })
  }
}
