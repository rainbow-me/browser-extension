import { kebabCase, camelCase } from 'lodash';
import { Box } from '../../../components/Box/Box';
import { Inset } from '../../../components/Inset/Inset';
import { Separator } from '../../../components/Separator/Separator';
import { Stack } from '../../../components/Stack/Stack';
import { Text } from '../../../components/Text/Text';
import { CodePreview } from '../../components/CodePreview';
import * as docs from '../../docs';
import { Docs, Example } from '../../createDocs';

type Params = {
  component: string;
  category: string;
};

function getDoc({ component, category }: Params) {
  return Object.values(docs).find(
    ({ default: doc }) =>
      doc.name?.toLowerCase() === camelCase(component).toLowerCase() &&
      doc.category.toLowerCase() === camelCase(category).toLowerCase(),
  )?.default as Docs;
}

export async function getStaticPaths() {
  const paths = Object.values(docs).map(({ default: doc }) => ({
    params: {
      category: kebabCase(doc.category),
      component: kebabCase(doc.name),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: Params }) {
  const { category, component } = params;
  const doc = getDoc({ component, category });
  return {
    props: {
      component: doc?.name || null,
      category: doc?.category || null,
    },
  };
}

export default function Component({ component, category }: Params) {
  const doc = getDoc({ component, category });
  return (
    <Stack space="44px">
      <Text as="h1" size="32pt" weight="bold">
        {doc?.name}
      </Text>
      {doc?.description}
      {doc?.examples && (
        <>
          <Separator strokeWeight="2px" />
          {doc?.examples?.map(
            (
              {
                name,
                description,
                enablePlayroom,
                enableCodeSnippet,
                showThemes,
                wrapper,
                showFrame,
                examples,
                Example,
              },
              index,
            ) => (
              <>
                {index !== 0 && <Separator strokeWeight="2px" />}
                <ExamplePreview
                  Example={Example}
                  description={description}
                  enableCodeSnippet={enableCodeSnippet}
                  enablePlayroom={enablePlayroom}
                  examples={examples}
                  key={index}
                  name={name}
                  showFrame={showFrame}
                  showThemes={showThemes}
                  wrapper={wrapper}
                />
              </>
            ),
          )}
        </>
      )}
    </Stack>
  );
}

function ExamplePreview({
  name,
  description,
  enableCodeSnippet = true,
  level = 0,
  showFrame = false,
  enablePlayroom = true,
  showThemes,
  wrapper,
  examples,
  Example,
}: Example & { level?: number }) {
  return (
    <Stack space="44px">
      {name && (
        <Text
          as={level > 0 ? 'h3' : 'h2'}
          size={level > 0 ? '23pt' : '26pt'}
          weight="bold"
        >
          {name}
        </Text>
      )}
      {description && (
        <Box style={{ paddingBottom: '8px' }}>
          <Stack space="44px">{description}</Stack>
        </Box>
      )}
      {Example && (
        <CodePreview
          Example={Example}
          enableCodeSnippet={enableCodeSnippet}
          enablePlayroom={enablePlayroom}
          showFrame={showFrame}
          showThemes={showThemes}
          wrapper={wrapper}
        />
      )}
      {examples?.map((example, i) => (
        <Inset key={i} vertical="12px">
          <ExamplePreview {...example} level={level + 1} />
        </Inset>
      ))}
    </Stack>
  );
}
