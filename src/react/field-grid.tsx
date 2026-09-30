import type { ReactNode } from "react";
import type { FieldStructure, FieldType, StructureNode } from "../core/field";
import { isFieldRow, isFieldSection } from "../core/field";

export interface FieldGridProps<T extends string> {
  structure: FieldStructure<T>;
  renderField: (field: FieldType<T>) => ReactNode;
  renderSection?: (section: { key: string; title?: string; description?: string }, children: ReactNode) => ReactNode;
  alignItemsEnd?: boolean;
  children?: ReactNode;
}

function renderNodes<T extends string>(
  nodes: StructureNode<T>[],
  renderField: (field: FieldType<T>) => ReactNode,
  renderSection: FieldGridProps<T>["renderSection"],
  alignItemsEnd: boolean,
  children: ReactNode,
  keyPrefix: string,
): ReactNode[] {
  return nodes.map((item, index) => {
    if (isFieldSection(item)) {
      const key = item.key ?? `${keyPrefix}section-${index}`;
      const inner = renderNodes(item.children, renderField, renderSection, alignItemsEnd, null, `${key}-`);
      const body = (
        <>
          {item.title ? <div data-section-title="">{item.title}</div> : null}
          {item.description ? <div data-section-description="">{item.description}</div> : null}
          {inner}
        </>
      );
      if (renderSection) return renderSection({ key, title: item.title, description: item.description }, body);
      return (
        <div key={key} data-section={key}>
          {body}
        </div>
      );
    }
    if (!isFieldRow(item)) {
      return (
        <div key={item.name} data-field={item.name}>
          {renderField(item)}
        </div>
      );
    }
    const rowId = item.fields.map((field) => field.name).join("+");
    const isLastNode = index === nodes.length - 1;
    return (
      <div key={`row-${rowId}`} data-row="" data-columns={item.columns} data-align={alignItemsEnd ? "end" : "start"}>
        {item.fields.map((field) => (
          <div key={field.name} data-field={field.name} data-colspan={field.colspan ?? 1}>
            {renderField(field)}
          </div>
        ))}
        {isLastNode ? children : null}
      </div>
    );
  });
}

export function FieldGrid<T extends string>({
  structure,
  renderField,
  renderSection,
  alignItemsEnd = false,
  children,
}: FieldGridProps<T>): ReactNode {
  return <>{renderNodes(structure, renderField, renderSection, alignItemsEnd, children, "")}</>;
}
