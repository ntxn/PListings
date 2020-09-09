import React, { useState } from 'react';

export interface NavItem {
  name: string;
  onClick(): void;
}

interface UserPageLayoutProps {
  header: JSX.Element;
  body: JSX.Element;
  active: string | number;
  navList: Record<string | number, NavItem>;
}

export const UserPageLayout = (props: UserPageLayoutProps): JSX.Element => {
  const [active, setActive] = useState(props.active);

  return (
    <div className="user-page-layout">
      <div className="user-page-layout__header">{props.header}</div>
      <div className="user-page-layout__nav sub-heading-tertiary">
        {Object.keys(props.navList).map(key => {
          const navItem = props.navList[key];

          return (
            <span
              key={key}
              className={`user-page-layout__nav__item ${
                active == key ? 'user-page-layout__nav__item--active' : ''
              }`}
              onClick={() => {
                navItem.onClick();
                setActive(key);
              }}
            >
              {navItem.name}
            </span>
          );
        })}
      </div>
      <div className="user-page-layout__content">{props.body}</div>
    </div>
  );
};
