import React from "react";
import PropTypes from "prop-types";
import { PortableText } from "@portabletext/react";
import Button from "@components/button/component.js";
import SVG from "@components/svg/component.js";
import { portableTextComponents } from "@utils/portableTextComponents.js";
import { getButtonTheme } from "@utils/getButtonTheme.js";
import { getSectionClasses } from "@utils/getSectionClasses.js";

import * as styles from "./styles.module.scss";

const PriceTable = ({ table }) => {
  const columns = table?.columns || [];
  const rows = table?.rows || [];
  if (!rows.length) return null;

  const tableEl = (
    <table className={styles.table}>
      {columns.length > 0 && (
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, r) => (
          <tr key={row._key || r}>
            {(row.cells || []).map((cell, c) =>
              c === 0 ? (
                <th key={c} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={c}>{cell}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!table.collapsible) return <div className={styles.tableWrapper}>{tableEl}</div>;

  return (
    <details className={styles.details}>
      <summary>
        {table.toggleLabel || "View details"}
        <span className={styles.chevron}>
          <SVG name="chevronDown" />
        </span>
      </summary>
      <div className={styles.tableWrapper}>{tableEl}</div>
    </details>
  );
};

PriceTable.propTypes = {
  table: PropTypes.shape({
    collapsible: PropTypes.bool,
    toggleLabel: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.shape({ cells: PropTypes.arrayOf(PropTypes.string) })),
  }),
};

// Intro text (heading + payment terms), one section button (e.g. "Get Started" → #contact),
// then three equal plan cards. Each card: title, price, features (✓ included /
// ✗ not included), optional price table (collapsible via <details>) and a footnote.
export const Pricing = ({
  body,
  plans = [],
  componentButtonLabel,
  componentButtonLink,
  componentBgColor,
  removeTopPadding,
  removeBottomPadding,
}) => {
  const containerClasses = getSectionClasses(styles, {
    componentBgColor,
    removeTopPadding,
    removeBottomPadding,
  });

  return (
    <div className={containerClasses}>
      <div className={styles.wrapper}>
        {Array.isArray(body) && body.length > 0 && (
          <div className={styles.intro}>
            <PortableText value={body} components={portableTextComponents} />
          </div>
        )}

        {componentButtonLabel && componentButtonLink && (
          <div className={styles.buttonWrapper}>
            <Button to={componentButtonLink} theme={getButtonTheme(componentBgColor)}>
              {componentButtonLabel}
            </Button>
          </div>
        )}

        <div className={styles.grid}>
          {plans.map((plan, i) => (
            <article key={plan._key || i} className={styles.card}>
              <h3 className={styles.planTitle}>{plan.title}</h3>

              {plan.price && (
                <p className={styles.price}>
                  <span className={styles.priceAmount}>{plan.price}</span>
                  {plan.priceNote && <span className={styles.priceNote}>{plan.priceNote}</span>}
                </p>
              )}

              {plan.description && <p className={styles.description}>{plan.description}</p>}

              {plan.features?.length > 0 && (
                <ul className={styles.features}>
                  {plan.features.map((feature, f) => (
                    <li
                      key={feature._key || f}
                      className={feature.included === false ? styles.excluded : styles.included}
                    >
                      <span className={styles.featureIcon}>
                        <SVG name={feature.included === false ? "x" : "check"} />
                      </span>
                      <span className="sr-only">{feature.included === false ? "Not included: " : "Included: "}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              )}

              <PriceTable table={plan.table} />

              {plan.footnote && <p className={styles.footnote}>{plan.footnote}</p>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

Pricing.propTypes = {
  body: PropTypes.array,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      _key: PropTypes.string,
      title: PropTypes.string,
      price: PropTypes.string,
      priceNote: PropTypes.string,
      description: PropTypes.string,
      features: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string, included: PropTypes.bool })),
      table: PropTypes.object,
      footnote: PropTypes.string,
    })
  ),
  componentButtonLabel: PropTypes.string,
  componentButtonLink: PropTypes.string,
  componentBgColor: PropTypes.oneOf(["white", "offWhite", "teal", "navy"]),
  removeTopPadding: PropTypes.bool,
  removeBottomPadding: PropTypes.bool,
};

export default Pricing;
