import AccountMenuList from "./components/account-menu-list";

interface AccountHomeProps {}

const AccountHome = async ({}: AccountHomeProps) => {
  return (
    <div className="p-6 ">
      <AccountMenuList />
    </div>
  );
};

export default AccountHome;
