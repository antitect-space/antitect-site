import { z } from "zod";

/**
 * What a learner sends in: links to the work, and anything they want to say
 * about it.
 *
 * Links only — there is no file upload anywhere in the learner area. A demo
 * recording, the working thing itself, a document: all of them are already
 * somewhere with a URL, and asking people on mobile data to upload a video
 * would be asking them to fail.
 *
 * Empty rows are dropped rather than refused. The form offers a couple to
 * start with, and somebody who fills one in has not made a mistake by leaving
 * the other blank.
 */

const HTTP_URL = /^https?:\/\/\S+$/i;

const link = z.object({
  label: z.string().trim().max(60),
  url: z.string().trim().max(2000),
});

function isEmpty(row: { label: string; url: string }): boolean {
  return row.label === "" && row.url === "";
}

export const submissionSchema = z
  .object({
    links: z.array(link).min(1),
    notes: z.string().trim().max(2000),
  })
  .superRefine((value, ctx) => {
    if (value.links.every(isEmpty)) {
      ctx.addIssue({
        code: "custom",
        path: ["links", 0, "url"],
        message: "Add at least one link to your work.",
      });
      return;
    }

    value.links.forEach((row, index) => {
      if (isEmpty(row)) return;
      if (!HTTP_URL.test(row.url)) {
        ctx.addIssue({
          code: "custom",
          path: ["links", index, "url"],
          message: "Enter a link that starts with https://",
        });
      }
      if (row.label === "") {
        ctx.addIssue({
          code: "custom",
          path: ["links", index, "label"],
          message: "Say what this link is.",
        });
      }
    });
  })
  .transform(({ links, notes }) => ({
    links: links.filter((row) => !isEmpty(row)),
    ...(notes ? { notes } : {}),
  }));

export type SubmissionInput = z.input<typeof submissionSchema>;
export type SubmissionBody = z.output<typeof submissionSchema>;

export const EMPTY_SUBMISSION: SubmissionInput = {
  links: [
    { label: "", url: "" },
    { label: "", url: "" },
  ],
  notes: "",
};
