import React from "react";
import Button from "@components/button/component.js";

import * as styles from "./styles.module.scss";

export const NotFound = () => (
  <div className={styles.container}>
    <div className={styles.wrapper}>
      <p className={styles.code}>404</p>
      <h1>Looks like you took a wrong turn.</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on course.</p>
      <Button to="/">
        Back to Home
      </Button>
    </div>
  </div>
);

export default NotFound;
