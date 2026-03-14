import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import type { Props } from '@theme/DocItem/Content';

function DocMetadata(): ReactNode {
  const { frontMatter, metadata } = useDoc();

  const creationDate = frontMatter.custom_creation_date as string | undefined;
  const lastUpdatedAt = metadata.lastUpdatedAt;
  const lastUpdatedBy = metadata.lastUpdatedBy;

  let formattedUpdateDate: string | undefined;
  let formattedCreationDate: string | undefined;

  if (lastUpdatedAt) {
    const date = new Date(lastUpdatedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    formattedUpdateDate = `${year}/${month}/${day}`;

    if (!creationDate) {
      formattedCreationDate = formattedUpdateDate;
    }
  }

  if (creationDate) {
    formattedCreationDate = creationDate;
  }

  if (!formattedCreationDate && !lastUpdatedAt && !lastUpdatedBy) {
    return null;
  }

  return (
    <ul className="theme-doc-meta">
      {formattedCreationDate && (
        <li className="theme-doc-meta-created">
          <span>Created:</span>
          <time>{formattedCreationDate}</time>
        </li>
      )}
      {formattedUpdateDate && (
        <li className="theme-doc-meta-updated">
          <span>Updated:</span>
          <time dateTime={new Date(lastUpdatedAt!).toISOString()}>{formattedUpdateDate}</time>
        </li>
      )}
      {lastUpdatedBy && (
        <li className="theme-doc-meta-author">
          <span>Author:</span>
          <address>{lastUpdatedBy}</address>
        </li>
      )}
    </ul>
  );
}

function useSyntheticTitle(): string | null {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender = !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

export default function DocItemContent({ children }: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      )}
      <DocMetadata />
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
