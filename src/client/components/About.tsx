import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { RiMailSendLine } from 'react-icons/ri';

export const About = (): JSX.Element => {
  return (
    <div className="about">
      <div className="about__header">
        <img src="/img/logo/logo-orange-white-bg.png" />
      </div>
      <h2 className="about__subheader">sell and buy secondhand items</h2>
      <h4 className="about__plistings__intro">
        plistings&apos; purpose is to make the process of selling or buying
        products as easy and smooth as possible. That&apos;s why those features
        are included in plistings:
      </h4>
      <ul className="about__plistings__features__details">
        {[
          'Post, edit and manage your listings at ease',
          'Save listings that you like',
          'A map indicate the listing location is provided for your convenience',
          'Contact your buyer/seller through plistings messaging system',
          'Filtering listings to make it easier for your search',
        ].map((item, i) => (
          <li className="about__plistings__features__item" key={i}>
            {item}
          </li>
        ))}
      </ul>
      <h4 className="about__plistings__features">Upcoming Features</h4>
      <ul className="about__plistings__features__details">
        {[
          'Notifications',
          'Search listings with keywords on top of filterings',
          'Attach a free tag to any listings with price $0',
          'Block malicious users',
          'Review users',
        ].map((item, i) => (
          <li className="about__plistings__features__item" key={i}>
            {item}
          </li>
        ))}
      </ul>

      <div className="about__me">
        <div className="about__me__photo">
          <img src="/me/img/me-profile-photo.jpeg" alt="My photo" />
        </div>

        <div className="about__me__content">
          <p className="about__me__intro">
            My name is Ngan Nguyen. I am an aspiring fullstack software
            engineer. I graduated from San Jose State University with a
            Bachelor&apos;s degree in Computer Science. Since graduated, I never
            stop learning and updating my knowledge with new technology to
            sharpen my skills.
          </p>
          <p className="about__me__intro">
            I have been working on plistings as a fullstack side project using
            ReactJS for front-end and NodeJS for back-end. It is written in
            Typescript and Javascript. During development, I&apos;ve always put
            plistings&apos;s performance a priority.
          </p>
          <p className="about__me__intro">
            If you notice any performance issues, bugs, or have any
            questions/suggestions, please don&apos;t hesitate to drop me a line
            <a
              href="mailto:ngan.tx.nguyen@gmail.com"
              className="btn-text btn-text--orange"
            >
              <RiMailSendLine style={{ marginRight: '0.3rem' }} />{' '}
              ngan.tx.nguyen@gmail.com{' '}
              <RiMailSendLine style={{ marginLeft: '0.3rem' }} />
            </a>
          </p>
          <div className="about__me__icons">
            <a
              href="https://www.linkedin.com/in/ngantxnguyen/"
              className="about__me__icons--linkedIn"
            >
              <FaLinkedin title="My LinkedIn Profile" />
            </a>
            <a
              href="https://github.com/ngantxnguyen"
              className="about__me__icons--github"
            >
              <FaGithub title="My Github Profile" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
