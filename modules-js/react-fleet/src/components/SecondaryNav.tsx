import React from 'react';

export default class SecondaryNav extends React.Component<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
> {
  static LINK_CLASS = 'nv-s-l-a';
  static ACTIVE_LINK_CLASS = 'nv-s-l-a--active';

  render() {
    const { children, className, ...rest } = this.props;
    let navClassName = 'nv-s nv-s--sticky';

    if (className) {
      navClassName = `${navClassName} ${className}`;
    }

    return (
      <nav {...rest} className={navClassName}>
        <input type="checkbox" id="nv-s-tr" className="nv-s-tr" aria-hidden />

        <ul className="nv-s-l">
          <li className="nv-s-l-i">
            <label htmlFor="nv-s-tr" className="nv-s-l-b">
              Navigation
            </label>
          </li>

          {React.Children.map(children, child => (
            <li className="nv-s-l-i">{child}</li>
          ))}
        </ul>
      </nav>
    );
  }
}
