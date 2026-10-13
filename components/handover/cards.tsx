import {
  Checkbox,
  HandoverCard,
  Step,
  SteppedText,
  StatusSwap,
  Swap,
  styles as s,
} from "@/components/handover/handover-card";
import { StatusGlyph, StatusLabel } from "@/components/handover/status-label";
import { enquiries, followups, leads, payments, video } from "@/content/handover";
import { cn } from "@/lib/utils";

/**
 * The five handover cards, each built from its copy in content/handover.ts.
 * Steps are numbered as in that file; the motion script moves a card through
 * them, and without it a card shows its last.
 */

const CHIP_TONES = {
  neutral: "bg-status-neutral-bg text-status-neutral-fg",
  attention: "bg-status-attention-bg text-status-attention-fg",
  done: "bg-status-done-bg text-status-done-fg",
} as const;

/** The hero's card: answering customer enquiries. It plays as the page opens. */
export function EnquiriesCard() {
  const { today, withAi } = enquiries;

  return (
    <HandoverCard
      name="enquiries"
      size="large"
      trigger="load"
      times={enquiries.times}
      caption={enquiries.caption}
      description={enquiries.description}
      today={
        <>
          <p className={s.sum}>{today.summary}</p>
          <ul className={s.stack}>
            {today.messages.map((message) => (
              <li key={message.name} className={s.block}>
                <div className={s.blockHead}>
                  <b>{message.name}</b>
                  <span className={s.blockRight}>
                    {message.time}
                    <Step from={message.at}>
                      <StatusGlyph icon={message.mark} className={s.mark} />
                    </Step>
                  </span>
                </div>
                <p className={s.body15}>{message.text}</p>
              </li>
            ))}
          </ul>
          <SteppedText items={today.footer} className={s.foot} />
        </>
      }
      withAi={
        <>
          <SteppedText items={withAi.summary} className={s.sum} />
          <ul className={s.items}>
            {withAi.items.map((item) => (
              <li key={item.who}>
                <p className={s.meta}>{item.who}</p>
                <Swap>
                  <Step until={item.at} className={s.bar} />
                  <Step from={item.at} rise as="p" className={s.body15}>
                    {item.result}
                  </Step>
                </Swap>
                <StatusSwap before={item.before} after={item.after} at={item.at} />
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

/** Sort new leads. */
export function LeadsCard() {
  const { today, withAi } = leads;

  return (
    <HandoverCard
      name="leads"
      times={leads.times}
      caption={leads.caption}
      description={leads.description}
      today={
        <>
          <p className={s.sum}>{today.summary}</p>
          <ul className={s.stack}>
            {today.people.map((person) => (
              <li key={person.name} className={s.block}>
                <div className={s.blockHead}>
                  <b>{person.name}</b>
                  <Step from={person.at}>
                    <StatusGlyph icon="tick" className={s.mark} />
                  </Step>
                </div>
                <p className={s.t13}>{person.text}</p>
              </li>
            ))}
          </ul>
          <SteppedText items={today.footer} className={s.foot} />
        </>
      }
      withAi={
        <>
          <SteppedText items={withAi.summary} className={s.sum} />
          <div>
            {withAi.groups.map((group) => (
              <div key={group.before.label} className={s.group}>
                <div className={s.groupHead}>
                  {group.after ? (
                    <StatusSwap before={group.before} after={group.after} at={group.at} />
                  ) : (
                    <StatusLabel tone={group.before.tone} icon={group.before.icon}>
                      {group.before.label}
                    </StatusLabel>
                  )}
                  <SteppedText items={group.count} className={s.count} />
                </div>
                <div className={s.chips}>
                  {group.chips.map((chip) => (
                    <Step key={chip.name} from={chip.at} rise className={cn(s.chip, CHIP_TONES[chip.tone])}>
                      {chip.name}
                    </Step>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      }
    />
  );
}

/** Follow up every lead. */
export function FollowupsCard() {
  const { today, withAi } = followups;

  return (
    <HandoverCard
      name="followups"
      times={followups.times}
      caption={followups.caption}
      description={followups.description}
      today={
        <>
          <p className={s.sum}>{today.summary}</p>
          <ul className={s.stack}>
            {today.reminders.map((reminder) => (
              <li key={reminder.task} className={s.block}>
                <div className={cn(s.row, s.rowTop)}>
                  <Checkbox at={reminder.at} />
                  <span className={s.grow}>
                    {reminder.task}
                    <br />
                    <span className={cn(s.meta, s.plain)}>{reminder.due}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <SteppedText items={today.footer} className={s.foot} />
        </>
      }
      withAi={
        <>
          <SteppedText items={withAi.summary} className={s.sum} />
          <div className={s.block}>
            <p className={cn(s.meta, s.plain)}>{withAi.reply.label}</p>
            <Swap className={s.t13}>
              <Step until={withAi.reply.at} className={cn(s.bar, s.thin)} />
              <Step from={withAi.reply.at} rise as="p">
                {withAi.reply.text}
              </Step>
            </Swap>
          </div>
          <ul className={s.items}>
            {withAi.sent.map((item) => (
              <li key={item.task}>
                <p className={s.t13}>{item.task}</p>
                <StatusSwap before={withAi.before} after={withAi.after} at={item.at} />
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

/** Match payments to orders. */
export function PaymentsCard() {
  const { today, withAi, alert, orders } = payments;

  const orderRows = (playing: boolean) => (
    <ul className={s.orders}>
      {orders.map((order) => (
        <li key={order.number}>
          <b>{order.number}</b>
          <span>{order.customer}</span>
          <span>{order.amount}</span>
          {order.paid ? (
            <StatusLabel tone="done" icon="tick">
              Paid
            </StatusLabel>
          ) : playing && "paidAt" in order ? (
            <StatusSwap
              before={{ tone: "attention", icon: "clock", label: "Pending" }}
              after={{ tone: "done", icon: "tick", label: "Paid" }}
              at={order.paidAt}
            />
          ) : (
            <StatusLabel tone="attention" icon="clock">
              Pending
            </StatusLabel>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <HandoverCard
      name="payments"
      times={payments.times}
      caption={payments.caption}
      description={payments.description}
      today={
        <>
          <p className={s.sum}>{today.summary}</p>
          <div className={s.block}>
            <div className={s.blockHead}>
              <span className={cn(s.meta, s.plain)}>{alert.label}</span>
              <Step from={today.matchedAt}>
                <StatusGlyph icon="tick" className={s.mark} />
              </Step>
            </div>
            <p className={cn(s.t13, s.strong)}>{alert.text}</p>
          </div>
          {orderRows(false)}
          <SteppedText items={today.footer} className={s.foot} />
        </>
      }
      withAi={
        <>
          <SteppedText items={withAi.summary} className={s.sum} />
          <div className={s.block}>
            <p className={cn(s.meta, s.plain)}>{alert.label}</p>
            <p className={cn(s.t13, s.strong)}>{alert.text}</p>
          </div>
          <ul className={cn(s.stack, s.checklist)}>
            {withAi.checks.map((check) => (
              <li key={check.text} className={s.row}>
                <Checkbox at={check.at} />
                {check.text}
              </li>
            ))}
          </ul>
          {orderRows(true)}
          <div className={s.row}>
            <Step from={withAi.receipt.at}>
              <StatusGlyph icon="tick" className={s.mark} />
            </Step>
            <Swap className={s.grow}>
              <Step until={withAi.receipt.at} className={cn(s.bar, s.thin)} />
              <Step from={withAi.receipt.at} rise>
                {withAi.receipt.text}
              </Step>
            </Swap>
          </div>
        </>
      }
    />
  );
}

/** Turn an idea into a video plan. */
export function VideoCard() {
  const { today, withAi } = video;

  return (
    <HandoverCard
      name="video"
      times={video.times}
      caption={video.caption}
      description={video.description}
      today={
        <>
          <p className={s.sum}>{today.summary}</p>
          <div className={cn(s.block, s.noteBlock)}>
            <div className={cn(s.blockHead, s.noteHead)}>
              <b>{today.idea}</b>
              <Step from={today.plannedAt}>
                <StatusGlyph icon="tick" className={s.mark} />
              </Step>
            </div>
            <div className={s.ruled}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <SteppedText items={today.footer} className={s.foot} />
        </>
      }
      withAi={
        <>
          <StatusSwap before={withAi.before} after={withAi.after} at={withAi.readyAt} />
          <div className={cn(s.sections, s.t13)}>
            {withAi.sections.map((section) => (
              <div key={section.heading} className={s.section}>
                <h4>{section.heading}</h4>
                {section.lines.map((line, index) => (
                  <Swap key={line}>
                    <Step until={section.at} lag={index * 120} className={cn(s.bar, s.thin)} />
                    <Step from={section.at} lag={index * 120} rise>
                      {line}
                    </Step>
                  </Swap>
                ))}
              </div>
            ))}
            <div className={cn(s.section, s.checklist)}>
              <h4>{withAi.checklist.heading}</h4>
              {withAi.checklist.items.map((item, index) => (
                <span key={item} className={s.row}>
                  <Checkbox at={withAi.checklist.at} lag={index * 150} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}
