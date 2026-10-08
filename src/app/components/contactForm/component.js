"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { PortableText } from "@portabletext/react";
import Button from "@components/button/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

// Netlify Forms: the form named "inquiry" is registered at deploy time by the static
// copy in public/__forms.html. ⚠️ Any field added/renamed here must be mirrored there,
// or Netlify silently drops it.
const FORM_NAME = "inquiry";
const RACE_DISTANCES = ["5K", "10K", "Half Marathon", "Marathon", "Ultra", "Other"];

const INITIAL_VALUES = {
  name: "",
  age: "",
  email: "",
  trainingForRace: "",
  raceDistance: "",
  raceDate: "",
  coachGoals: "",
  referralSource: "",
  "bot-field": "",
};

const validate = (values) => {
  // Order matches the form layout, so the first error gets focus
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";
  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!values.age) errors.age = "Please enter your age.";
  else if (Number(values.age) < 1 || Number(values.age) > 120) errors.age = "Please enter a valid age.";
  if (!values.trainingForRace) errors.trainingForRace = "Please choose yes or no.";
  if (values.trainingForRace === "Yes") {
    if (!values.raceDistance) errors.raceDistance = "Please choose a race distance.";
    if (!values.raceDate) errors.raceDate = "Please enter the race date.";
  }
  if (!values.coachGoals.trim()) errors.coachGoals = "Please tell me what you're looking for in a coach.";
  return errors;
};

export const ContactForm = ({
  body,
  successMessage,
  submitButtonLabel,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const containerClasses = getSectionClasses(styles, {
    componentBgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(`inquiry-${firstField}`)?.focus();
      return;
    }

    setStatus("submitting");

    const payload = {
      "form-name": FORM_NAME,
      // Email subject for the Netlify notification (replaces the default "[Netlify] …" one).
      // Netlify's own subject variables can't include form answers, so it's built here.
      subject: `${values.name.trim()} - Run With Nicole New Coaching Inquiry`,
      ...values,
    };
    if (values.trainingForRace !== "Yes") {
      payload.raceDistance = "";
      payload.raceDate = "";
    }

    // Netlify Forms only exists on Netlify — locally, pretend it worked.
    if (process.env.NODE_ENV === "development") {
      console.info("[dev] Inquiry form submission (not sent):", payload);
      setStatus("success");
      return;
    }

    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
    } catch (err) {
      console.error("Inquiry form error:", err);
      setStatus("error");
    }
  };

  const REQUIRED = ["name", "email", "age", "raceDistance", "raceDate", "coachGoals"];
  const fieldProps = (name) => ({
    id: `inquiry-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    ...(REQUIRED.includes(name) && { "aria-required": "true" }),
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `inquiry-${name}-error` : undefined,
  });

  const errorFor = (name) =>
    errors[name] ? (
      <p id={`inquiry-${name}-error`} className={styles.error}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        <div className={styles.intro}>
          {Array.isArray(body) && <PortableText value={body} components={portableTextComponents} />}
        </div>

        <div className={styles.formCard}>
          {status === "success" ? (
            <div className={styles.success} role="status">
              <p>{successMessage || "Thanks for reaching out! I'll be in touch soon."}</p>
            </div>
          ) : (
            <form name={FORM_NAME} onSubmit={handleSubmit} noValidate className={styles.form}>
              {/* Honeypot: hidden from people, bots fill it in */}
              <p className="sr-only" aria-hidden="true">
                <label>
                  Don&apos;t fill this out: <input {...fieldProps("bot-field")} tabIndex={-1} autoComplete="off" />
                </label>
              </p>

              {/* Row 1: name + email */}
              <div className={styles.row}>
                <div className={classNames(styles.field, styles.grow)}>
                  <label htmlFor="inquiry-name">Full name *</label>
                  <input type="text" autoComplete="name" {...fieldProps("name")} />
                  {errorFor("name")}
                </div>
                <div className={classNames(styles.field, styles.grow)}>
                  <label htmlFor="inquiry-email">Email address *</label>
                  <input type="email" autoComplete="email" {...fieldProps("email")} />
                  {errorFor("email")}
                </div>
              </div>

              {/* Row 2: age + training for a race */}
              <div className={styles.row}>
                <div className={classNames(styles.field, styles.grow)}>
                  <label htmlFor="inquiry-age">Age *</label>
                  <input type="number" inputMode="numeric" min="1" max="120" {...fieldProps("age")} />
                  {errorFor("age")}
                </div>
                <fieldset
                  role="radiogroup"
                  aria-required="true"
                  className={classNames(styles.field, styles.grow)}
                  aria-describedby={errors.trainingForRace ? "inquiry-trainingForRace-error" : undefined}
                >
                  <legend>Are you training for a race? *</legend>
                  <div className={styles.radios}>
                    {["Yes", "No"].map((option) => (
                      <label key={option} className={styles.radio}>
                        <input
                          type="radio"
                          id={option === "Yes" ? "inquiry-trainingForRace" : undefined}
                          name="trainingForRace"
                          value={option}
                          checked={values.trainingForRace === option}
                          onChange={handleChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errorFor("trainingForRace")}
                </fieldset>
              </div>

              {/* Only when training for a race: distance + date */}
              {values.trainingForRace === "Yes" && (
                <div className={styles.row}>
                  <div className={classNames(styles.field, styles.grow)}>
                    <label htmlFor="inquiry-raceDistance">Race distance *</label>
                    <select {...fieldProps("raceDistance")}>
                      <option value="">Choose a distance</option>
                      {RACE_DISTANCES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errorFor("raceDistance")}
                  </div>
                  <div className={classNames(styles.field, styles.grow)}>
                    <label htmlFor="inquiry-raceDate">Race date *</label>
                    <input type="date" {...fieldProps("raceDate")} />
                    {errorFor("raceDate")}
                  </div>
                </div>
              )}

              {/* Row 3 */}
              <div className={styles.field}>
                <label htmlFor="inquiry-coachGoals">What are you looking for in a coach? *</label>
                <textarea rows={5} maxLength={2000} {...fieldProps("coachGoals")} />
                {errorFor("coachGoals")}
              </div>

              {/* Row 4 */}
              <div className={styles.field}>
                <label htmlFor="inquiry-referralSource">How did you hear about me?</label>
                <input type="text" {...fieldProps("referralSource")} />
              </div>

              {status === "error" && (
                <p className={styles.submitError} role="alert">
                  Something went wrong sending your inquiry. Please try again, or email me directly.
                </p>
              )}

              <Button
                type="submit"
                theme="navy"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Sending…" : submitButtonLabel || "Send Inquiry"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

ContactForm.propTypes = {
  body: PropTypes.array,
  successMessage: PropTypes.string,
  submitButtonLabel: PropTypes.string,
  componentBgColor: PropTypes.oneOf(["white", "offWhite", "teal", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default ContactForm;
