// Shared renderers for Sanity rich text (body fields). Pass to <PortableText components={...} />.
export const portableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || "";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
          {children}
        </a>
      );
    },
  },
};
