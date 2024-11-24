import { type AuthUserTypes, getAuthUserDetails } from '@/lib/queries/user-queries';

// Define the conditions
const conditionsMap = {
  isAuthenticated: (user: AuthUserTypes) => !!user,
  hasAgency: (user: AuthUserTypes) => !!user.Agency,
  isMember: (user: AuthUserTypes) => !!user.Member,
  hasSubAccount: (user: AuthUserTypes) => !!user.Agency?.SubAccount,
} as const;

// Create an enum from the keys of conditionsMap
type ConditionNames = keyof typeof conditionsMap;

/**
 * Higher-order component that wraps a given component and performs authentication checks
 * based on specified conditions.
 *
 * @param {ConditionNames[]} conditionNames - An array of condition names to check against the authenticated user.
 * @param {any} WrappedComponent - The component to be wrapped and rendered if all conditions are met.
 * @returns {Function} A function that takes props and returns either the wrapped component with user details
 *                     or a fallback UI if authentication fails or conditions are not met.
 *
 * @example
 * ```tsx
 * const conditions = ['hasAgency'];
 * const ProtectedComponent = withAuthChecks(conditions, MyComponent);
 * ```
 */
export default function withAuthChecks(conditionNames: ConditionNames[], WrappedComponent: any) {
  return async function withAuthChecks(props: any) {
    const user = await getAuthUserDetails();

    if (!user) {
      return <div>User not authenticated</div>;
    }
    for (const conditionName of conditionNames) {
      const condition = conditionsMap[conditionName];
      if (condition && !condition(user)) {
        return (
          <div>
            Access denied:
            {conditionName}
          </div>
        ); // or any other fallback UI
      }
    }

    return <WrappedComponent {...props} user={user} />;
  };
}
