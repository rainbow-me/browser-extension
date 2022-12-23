import { isAddress, isValidMnemonic } from 'ethers/lib/utils';
import { motion } from 'framer-motion';
import { startsWith } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { addHexPrefix, isValidPrivateKey } from '~/core/utils/ethereum';
import {
  Box,
  Button,
  Inline,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { placeholderStyle } from '~/design-system/components/Input/Input.css';
import { textStyles } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../urls';

const validateSecret = (secret: string) => {
  // check if it's a private key
  if (startsWith(secret.trimEnd().trimStart().toLowerCase(), '0x')) {
    return isValidPrivateKey(secret);
  }
  return isValidMnemonic(secret.trimEnd().trimStart());
};

export function ImportWallet() {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const [secrets, setSecrets] = useState(['']);
  const { setCurrentAddress } = useCurrentAddressStore();
  const { updateStatus } = useAuth();

  const [validity, setValidity] = useState<
    { valid: boolean; too_long: boolean; type: string | undefined }[]
  >([]);

  const updateValidity = useCallback((newSecrets: string[]) => {
    const newValidity = newSecrets.map((secret) => {
      let too_long = false;
      let type = undefined;
      const valid = validateSecret(secret);
      if (!valid) {
        if (startsWith(secret.toLowerCase(), '0x')) {
          type = 'pkey';
          if (addHexPrefix(secret).length > 66) {
            too_long = true;
          }
        } else {
          if (secret.split(' ').length > 12) {
            too_long = true;
            type = 'seed';
          }
        }
      }
      return {
        valid,
        too_long,
        type,
      };
    });
    if (newValidity.filter((word) => !word.valid).length === 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    setValidity(newValidity);
  }, []);

  const handleSeedChange = useCallback(
    (e: { target: { value: string } }, index: number) => {
      const newSecrets = [...secrets] as string[];
      newSecrets[index] = e.target.value;
      updateValidity(newSecrets);
      setSecrets(newSecrets);
    },
    [secrets, updateValidity],
  );
  const handleImportWallet = useCallback(async () => {
    if (secrets.length === 1 && secrets[0] === '') return;
    // If it's only one private key or address, import it directly and go to wallet screen
    if (secrets.length === 1) {
      if (isValidPrivateKey(secrets[0]) || isAddress(secrets[0])) {
        const address = (await wallet.importWithSecret(secrets[0])) as Address;
        setCurrentAddress(address);
        updateStatus();
        navigate(ROUTES.CREATE_PASSWORD);
        return;
      }
    }

    navigate(ROUTES.IMPORT__SELECT, {
      state: { secrets },
    });
  }, [navigate, secrets, setCurrentAddress, updateStatus]);

  const handleAddAnotherOne = useCallback(() => {
    const newSecrets = [...secrets, ''];
    setSecrets(newSecrets);
    updateValidity(newSecrets);
  }, [secrets, updateValidity]);

  const handleRemove = useCallback(() => {
    const newSecrets = secrets.slice(0, -1);
    setSecrets(newSecrets);
    updateValidity(newSecrets);
  }, [secrets, updateValidity]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Inline
          wrap={false}
          alignVertical="center"
          alignHorizontal="center"
          space="5px"
        >
          <Symbol
            symbol="doc.plaintext"
            size={16}
            color="transparent"
            weight={'bold'}
          />
          <Text size="16pt" weight="bold" color="label" align="center">
            {i18n.t('import_wallet.title')}
          </Text>
        </Inline>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('import_wallet.description')}
          </Text>
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box
        paddingTop="28px"
        width="full"
        style={{
          overflow: 'auto',
          height: '400px',
        }}
      >
        <Stack space="10px">
          {secrets.map((_, i) => (
            <Box
              as={motion.div}
              whileTap={{ scale: transformScales['0.96'] }}
              transition={transitions.bounce}
              height="full"
              width="full"
              key={`seed_${i}`}
              position="relative"
            >
              <Box
                as="textarea"
                background="surfaceSecondaryElevated"
                borderRadius="12px"
                borderWidth="1px"
                borderColor="buttonStroke"
                width="full"
                padding="12px"
                placeholder={i18n.t('import_wallet.placeholder')}
                value={secrets[i]}
                onChange={(e) => handleSeedChange(e, i)}
                className={[
                  placeholderStyle,
                  textStyles({
                    color: 'label',
                    fontSize: '14pt',
                    fontWeight: 'regular',
                    fontFamily: 'rounded',
                  }),
                ]}
                style={{
                  height: '96px',
                  resize: 'none',
                }}
              ></Box>
              {validity[i]?.valid === false && validity[i]?.too_long && (
                <Box position="absolute" marginTop="-24px" paddingLeft="12px">
                  <Inline space="4px" alignVertical="center">
                    <Symbol
                      symbol={'exclamationmark.triangle.fill'}
                      size={11}
                      color={'orange'}
                      weight={'bold'}
                    />
                    <Text size="11pt" weight="regular" color={'orange'}>
                      {validity[i].type === 'pkey'
                        ? i18n.t('import_wallet.too_many_chars')
                        : i18n.t('import_wallet.too_many_words')}
                    </Text>
                  </Inline>
                </Box>
              )}
              {i > 0 && i === secrets.length - 1 && secrets[i].length === 0 && (
                <Box
                  position="absolute"
                  marginTop="-30px"
                  paddingLeft="12px"
                  style={{
                    right: '0px',
                  }}
                >
                  <Button
                    color="red"
                    height="24px"
                    variant="transparent"
                    width="full"
                    onClick={handleRemove}
                  >
                    {i18n.t('import_wallet.remove')}
                  </Button>
                </Box>
              )}
            </Box>
          ))}
          {isValid && (
            <Button
              symbol="plus.circle.fill"
              symbolSide="left"
              color="accent"
              height="44px"
              variant="transparent"
              width="full"
              onClick={handleAddAnotherOne}
            >
              {i18n.t('import_wallet.add_another')}
            </Button>
          )}
        </Stack>
      </Box>

      <Box width="full">
        <Rows alignVertical="top" space="8px">
          <Button
            symbol="arrow.uturn.down.circle.fill"
            symbolSide="left"
            color={isValid ? 'accent' : 'labelQuaternary'}
            height="44px"
            variant={isValid ? 'flat' : 'disabled'}
            width="full"
            onClick={handleImportWallet}
          >
            {secrets.length > 1
              ? i18n.t('import_wallet.import_wallet_plural')
              : i18n.t('import_wallet.import_wallet')}
          </Button>
        </Rows>
      </Box>
    </FullScreenContainer>
  );
}
