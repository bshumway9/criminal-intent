import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, Link } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

interface HeaderIconLinkProps {
    href: Href;
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    color: string;
    size?: number;
    accessibilityLabel: string;
    paddingHorizontal?: number;
}

/**
 * Reusable header icon link that wraps a Pressable + Link + MaterialCommunityIcons.
 */
export function HeaderIconLink({
    href,
    iconName,
    color,
    size = 24,
    accessibilityLabel,
    paddingHorizontal = 12,
}: HeaderIconLinkProps) {
    return (
        <Link href={href} asChild>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                style={({ pressed }) => [{ paddingHorizontal, opacity: pressed ? 0.6 : 1, flexDirection: 'row' }]}
            >
                <MaterialCommunityIcons style={{ paddingHorizontal }} name={iconName} size={size} color={color} />
            </Pressable>
        </Link>
    );
}
