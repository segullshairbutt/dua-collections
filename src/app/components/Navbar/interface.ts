export interface NavbarGeneralProps {
  navbar?: boolean;
  toggle: () => void;
}

export interface MenuLinksProps extends NavbarGeneralProps {
  queryParm?: string | null;
  ulClassName?: string;
}

export interface NavLinkProps extends NavbarGeneralProps {
  name: string;
  isActive?: boolean;
  url: {
    pathname: string;
    query?: { tag: string };
  };
}
