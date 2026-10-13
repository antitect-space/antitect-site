import { Button } from "@/components/ui/button";
import { contact } from "@/content/home";
import { filled } from "@/lib/content";
import { CONTACT, whatsappChat } from "@/lib/site";

/**
 * "Talk to us" (Home B, section 6, design section 10). WhatsApp first, with
 * the message started for them; then email and phone, each a 44px target.
 * No city or address: that is the footer's.
 */
export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section-pad scroll-mt-4 border-t border-rule">
      <div className="container-site grid gap-6 lg:grid-cols-[368fr_760fr]">
        <h2 id="contact-title" className="type-h2 text-ink">
          {contact.title}
        </h2>

        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="type-lead max-w-[600px] text-ink-muted">
            <p>{contact.line}</p>
            {filled(contact.replyTime) ? <p>{contact.replyTime}</p> : null}
          </div>

          <div className="flex flex-col gap-6 max-lg:pt-2">
            <Button asChild size="lg" variant="secondary" className="self-start px-5">
              <a href={whatsappChat(contact.whatsapp.prefill)} target="_blank" rel="noopener noreferrer">
                {contact.whatsapp.label}
              </a>
            </Button>

            <dl className="flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <dt className="type-meta font-medium text-ink-muted">Email</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`} className="flex min-h-11 items-center text-lg leading-none font-semibold text-ink underline-offset-4 hover:underline">
                    {CONTACT.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="type-meta font-medium text-ink-muted">Phone</dt>
                <dd>
                  <a href={CONTACT.phoneHref} className="flex min-h-11 items-center text-lg leading-none font-semibold text-ink tabular-nums underline-offset-4 hover:underline">
                    {CONTACT.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
