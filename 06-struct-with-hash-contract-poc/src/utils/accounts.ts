import {
  PublicKey,
  fetchAccount,
} from 'snarkyjs';

export { loopUntilAccountExists };


async function loopUntilAccountExists({
  account,
  eachTimeNotExist,
  isZkAppAccount,
}: {
  account: PublicKey;
  eachTimeNotExist: () => void;
  isZkAppAccount: boolean;
}) {
  for (;;) {
    let response = await fetchAccount({ publicKey: account });
    let accountExists = response.account !== undefined;
    //console.log(response.account);

    if (isZkAppAccount) {
      // CHANGED: accountExists = response.account?.appState !== undefined;
      accountExists = response.account?.zkapp?.appState !== undefined;
    }

    if (!accountExists) {
      eachTimeNotExist();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      // TODO add optional check that verification key is correct once this is available in SnarkyJS
      return response.account!;
    }
  }
}
