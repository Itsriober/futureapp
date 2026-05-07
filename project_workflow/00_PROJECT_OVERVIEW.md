# 00 PROJECT OVERVIEW

## Product Identity
- Product Name: Listi (working title)
- Product Type: Personal finance + lifestyle wishlist management web application
- Target Platform: Web-first React SPA, designed for seamless migration to React Native / Expo
- Owner: Harmon (Illustriober Creatives)
- Primary Audience: Young urban professionals in Nairobi and similar African markets aged 20–35 who earn a monthly salary and struggle with mid-month impulse capture and end-of-month spending paralysis.

## Problem Statement
Users can capture desires throughout the month, but existing budgeting tools only track spending after the fact. There is no system helping them decide which wishlist items to act on each payday while preserving their budget.

## Product Vision
Listi is a forward-looking personal lifestyle budget allocator disguised as a beautiful wishlist experience. The app turns desire capture into a mood-board journey and payday into a confident allocation moment. It helps users buy what matters now, defer what does not, and gradually achieve their wishlist without breaking the bank.

## Core Value
- Capture desires instantly across categories
- Allocate discretionary budget to the right items each payday
- Preserve financial safety with fixed obligations and savings
- Make the wishlist feel aspirational, not restrictive
- Build daily engagement through a visually rich board

## User Role
- Authenticated User only
- Private, single-user data scope
- No social or shared list features in MVP

## Current App Status (May 2026)
- Implemented: onboarding flow, authenticated profile screen, wishlist board, budget manager, suggestion/purchase flow
- Partially implemented: Supabase integration for wishlist items, budgets, profiles
- Missing or incomplete relative to the brief:
  - full payday allocation engine
  - fixed obligations manager with savings locking
  - allocation history
  - rich profile card with zodiac/hobbies/personality
  - item detail view
  - purchase animation/confetti feedback
  - multi-step onboarding beyond basic income capture
  - PWA installation/offline support
  - Google OAuth and richer auth options

## Goals for the Specification
1. Capture the full product intent from `listi-project-prief.md`
2. Align the implementation plan with the current codebase
3. Provide a clear next action plan to complete MVP
