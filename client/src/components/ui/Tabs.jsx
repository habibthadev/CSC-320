import React, { useState } from "react";

const Tabs = ({
  children,
  defaultValue,
  value,
  onValueChange,
  className = "",
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  const handleTabChange = (newValue) => {
    if (!value) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const triggers = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsTrigger"
  );

  const contents = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsContent"
  );

  const currentValue = value || activeTab;

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {triggers.map((trigger) => {
          return React.cloneElement(trigger, {
            key: trigger.props.value,
            active: currentValue === trigger.props.value,
            onClick: () => handleTabChange(trigger.props.value),
          });
        })}
      </div>
      <div className="mt-2">
        {contents.map((content) => {
          return React.cloneElement(content, {
            key: content.props.value,
            active: currentValue === content.props.value,
          });
        })}
      </div>
    </div>
  );
};

const TabsTrigger = ({
  children,
  value,
  active,
  onClick,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = ({ children, value, active, className = "", ...props }) => {
  if (!active) return null;

  return (
    <div className={`mt-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

TabsContent.displayName = "TabsContent";

export { Tabs, TabsTrigger, TabsContent };
