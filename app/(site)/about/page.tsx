import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Cut, CutFrame } from "@/components/cut";
import { Button } from "@/components/ui/button";
import { about, team } from "@/content/about";
import { workshopPhotos } from "@/content/gallery";
import { CONTACT } from "@/lib/site";
import { shareMetadata } from "@/lib/metadata";

const title = "About Antitect — Building Practical AI Capability Across Africa";
const description =
  "Who we are, how we teach, and why we believe learning should lead to the ability to do.";

export const metadata: Metadata = {
  title: { absolute: title },
  ...shareMetadata({ title, description, path: "/about" }),
};

/** Short on purpose: people read this to decide whether the company is real. */
export default function AboutPage() {
  const photo = workshopPhotos[2]!;

  return (
    <>
      <section aria-labelledby="about-title" className="border-b">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
          <div>
            <h1 id="about-title" className="text-display text-[2.5rem] sm:text-6xl">
              {about.headline}
            </h1>
            <p className="mt-6 max-w-[42ch] text-xl leading-[1.5]">{about.lead}</p>
            <div className="mt-8 max-w-[58ch] space-y-5 text-lg leading-[1.6] text-muted-foreground">
              {about.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <Cut
            corner="tr"
            className="relative aspect-[4/3] w-full self-start overflow-hidden bg-muted"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 32rem, 100vw"
              style={{ objectPosition: photo.position }}
              className="object-cover"
            />
          </Cut>
        </div>
      </section>

      {team.length > 0 ? (
        <section aria-labelledby="team-title" className="border-b">
          <div className="container-page py-16 lg:py-24">
            <h2 id="team-title" className="text-display text-4xl sm:text-5xl">
              Who runs it
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li key={member.name}>
                  <CutFrame corner="tr">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                      <Image
                        src={member.photo}
                        alt={`${member.name}, ${member.role} at Antitect.`}
                        fill
                        sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-title text-xl">{member.name}</h3>
                      <p className="mt-1 text-[0.9375rem] font-semibold text-muted-foreground">{member.role}</p>
                      <p className="mt-3 leading-[1.5] text-muted-foreground">{member.bio}</p>
                    </div>
                  </CutFrame>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="find-title" className="border-b">
        <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:py-24">
          <div>
            <h2 id="find-title" className="text-display text-3xl sm:text-4xl">
              Where to find us
            </h2>
            <address className="mt-6 space-y-3 text-lg not-italic">
              <p className="leading-[1.5] text-muted-foreground">{CONTACT.address.display}</p>
              <p>
                <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-4 hover:no-underline">
                  {CONTACT.email}
                </a>
              </p>
              <p>
                <a href={CONTACT.phoneHref} className="underline underline-offset-4 hover:no-underline">
                  {CONTACT.phoneDisplay}
                </a>
              </p>
            </address>
          </div>

          <div className="sm:justify-self-end">
            <p className="text-lg font-semibold">Start where most people start.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/community">Join the community</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/events">See upcoming events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
