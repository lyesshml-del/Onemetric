const EXAMPLE = `// After the snippet has loaded:
onemetric.track("signup", { plan: "pro" });
onemetric.track("login");
onemetric.track("purchase", { amount: 49, currency: "USD" });

// Button click
button.addEventListener("click", () =>
  onemetric.track("button_click", { id: "cta-hero" }),
);

// Form submission
form.addEventListener("submit", () =>
  onemetric.track("form_submit", { form: "newsletter" }),
);`;

/** How to send custom events with the tracker. Pure/presentational. */
export function CustomEventsDoc() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Track custom events from your site by calling{" "}
        <code>onemetric.track(name, props)</code> once the snippet has loaded.
      </p>
      <pre className="bg-muted overflow-x-auto rounded-md border p-4 text-sm">
        <code>{EXAMPLE}</code>
      </pre>
      <p className="text-muted-foreground">
        Common events: signup, login, purchase, button clicks, form submissions.
      </p>
    </div>
  );
}
