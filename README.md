PLEASE NOTE: I vibecoded the crap out of this :)

# Review Coordination Tool

A visual tool for coordinating peer reviews across teams. Manage who reviews whom with an interactive 2D matrix, track review coverage, and ensure everyone gets quality feedback from senior team members.

Live deployment: https://crimsoncrayfish.github.io/reviews-mapper

Page URLs:
- https://crimsoncrayfish.github.io/reviews-mapper/?page=people
- https://crimsoncrayfish.github.io/reviews-mapper/?page=matrix

## Features

### Interactive Review Matrix
- **2D Grid Interface**: Rows are reviewers, columns are reviewees
- **One-Click Assignment**: Single-click for one-way review, double-click for mutual review
- **Self-Reviews**: Automatically assigned (diagonal cells), don't count toward statistics
- **Visual Indicators**: Green checkmarks for active reviews, gray circles for unassigned
- **Hover Highlighting**: Entire row and column highlight when hovering over a cell
- **Drag-and-Drop Reordering**: Reorder people in both rows and columns independently

### People Management
- **CSV Import**: Bulk import with format `name,level,project`
- **Manual Entry**: Add people individually or in bulk
- **Inline Editing**: Edit names, titles, and projects directly in the list
- **Title Levels**: Junior, Intermediate, Senior, Lead, External
- **Project Assignment**: Auto-map people on the same project for reviews
- **Person Flagging**: Click names to flag people of concern (highlighted in red)

### Statistics Tracking
For each person, track:
- **Reviews Received**: How many people review them (excluding self)
- **Reviews Doing**: How many people they review (excluding self)
- **Senior/Lead Coverage**: Count of senior/lead reviewers (with warning if zero)

### UI/UX
- **Dark Mode Design**: Modern, professional dark theme
- **Compact View**: Ultra-dense mode hides UI elements for maximum grid space
- **Sticky Headers**: Row and column headers stay visible when scrolling
- **Project Color Coding**: Consistent colors per project across the interface
- **Toast Notifications**: Non-blocking notifications for actions
- **Full-Width Matrix**: Table uses full viewport width
- **Slideout Forms**: Add people forms slide in from the right

### Data Persistence
- **localStorage**: All data saved automatically in browser
- **CSV Export**: Export people list with names, titles, and projects
- **Excel Export**: Export full review matrix as .xlsx file

### URL Navigation
- `?page=people` - People management page
- `?page=matrix` - Review matrix page
- Legacy path links (`/mapping`, `/matrix`) still resolve to matrix for backward compatibility
- Browser back/forward buttons work correctly

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

This project is configured for GitHub Pages deployment using the `gh-pages` package and the `homepage` field in `package.json`.

1. Ensure your repository remote points to the GitHub repo.
2. Install dependencies:

```bash
npm install
```

3. Deploy:

```bash
npm run deploy
```

What this does:
- Runs `npm run build` first via `predeploy`
- Publishes the `dist` folder to the `gh-pages` branch
- Serves the app at `https://crimsoncrayfish.github.io/reviews-mapper`

## How to Use

### 1. Add People

**Via CSV Import:**
1. Click "Add People" button
2. Switch to "CSV Import" tab
3. Paste or upload CSV with format: `name,level,project`
4. Click "Import CSV Data"

Example CSV:
```
Alice,senior,ProjectA
Bob,intermediate,ProjectA
Charlie,lead,ProjectB
Diana,external,Consulting
```

**Via Manual Entry:**
1. Click "Add People" button
2. Switch to "Manual Entry" tab
3. Enter names (one per line)
4. Select default title
5. Click "Add Names"

### 2. Assign Reviews

1. Navigate to "Matrix" page
2. **Single-click** a cell to create a one-way review (reviewer → reviewee)
3. **Double-click** a cell to create a mutual review (reviewer ↔ reviewee)
4. Click a checkmark to remove that review assignment
5. Self-reviews (diagonal) are automatic and cannot be changed

### 3. Flag People of Concern

Click any person's name (in row/column headers) to toggle a flag. Flagged people are:
- Highlighted in red throughout the matrix
- Marked with a flag icon
- Easy to spot for follow-up actions

Use this to mark people who:
- Don't have enough reviewers
- Need senior/lead coverage
- Require special attention

### 4. Reorder People

Drag the grip handles (⋮⋮) on row or column headers to reorder. Order persists across sessions.

### 5. Compact Mode

Click "Compact" button on the matrix page to:
- Hide navigation and instructions
- Minimize all padding and spacing
- Show badges only on hover
- Maximize visible grid space
- Remove all borders and decorations

Perfect for large teams or presenting the matrix.

### 6. Export Data

**CSV Export**: Exports people list (names, titles, projects) - click "CSV" in navigation

**Excel Export**: Exports complete review matrix with:
- All review assignments marked with 'x'
- Names and titles
- Statistics columns
- Click "Excel" in navigation or Excel icon in compact mode

## Understanding the Matrix

### Reading the Grid
- **Left to right**: Person in the row reviews people in the columns
- Example: If Alice is in row 3, and there's an 'x' in Bob's column, then **Alice reviews Bob**

### Statistics Column (Right Side)
- **Received**: Number of people reviewing this person
- **Doing**: Number of people this person reviews
- **Senior/Lead**: Count of senior/lead people reviewing this person
  - Green with checkmark = Has senior/lead coverage
  - Amber with warning = No senior/lead coverage

### Color Indicators
- **Blue cells**: Both people are on the same project
- **Red borders/background**: Person is flagged for concern
- **Orange badge**: External person
- **Purple badge**: Lead
- **Blue badge**: Senior
- **Green badge**: Intermediate
- **Gray badge**: Junior

## Technical Stack

- **Framework**: React 19 + Vite
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Excel Export**: xlsx
- **Storage**: Browser localStorage

## Data Model

```javascript
// Person
{
  id: string,           // UUID
  name: string,
  title: 'junior' | 'intermediate' | 'senior' | 'lead' | 'external',
  project: string,      // Optional project name
  order: number,        // For drag-and-drop ordering
  flagged: boolean      // Flag for people of concern
}

// Review Relationship
{
  reviewerId: string,   // Person doing the review
  revieweeId: string    // Person receiving the review
}
```

**Note**: Self-reviews are implicit (not stored) and always present.

## Key Design Decisions

### Auto-Mapping by Project
When importing people with projects, the tool automatically creates bidirectional review relationships between all people on the same project. These can be unchecked if not needed.

### Senior/Lead Coverage
The tool highlights people who have zero senior or lead reviewers, helping ensure everyone gets quality feedback from experienced team members.

### Compact vs Comfortable
- **Comfortable**: Full UI with instructions, large headers, visible badges
- **Compact**: Minimal UI, tiny cells, badges on hover only, maximum density, full-screen grid

### Sticky Positioning
- First column (row headers) stays visible when scrolling horizontally
- Header row (column headers) stays visible when scrolling vertically
- Statistics column stays visible when scrolling left
- Proper z-index layering for overlapping sticky elements

### Why Better Than Excel
- Visual feedback for all interactions
- Automatic statistics calculation
- Drag-and-drop reordering
- Project-based auto-mapping
- Click-based review assignment (no typing)
- Persistent storage (no manual saves)
- Professional dark UI
- Hover highlighting for context
- Flag system for tracking concerns

## Browser Support

Works in all modern browsers that support:
- CSS Grid and Flexbox
- localStorage API
- ES6+ JavaScript
- CSS position: sticky

Tested on: Chrome, Firefox, Safari, Edge

## Tips

- Use **compact mode** when working with 20+ people
- **Flag people** who need attention so they stand out
- **Export to Excel** to share with stakeholders
- **Double-click** is faster for setting up mutual reviews
- Hover over cells to see which person reviews whom
- Use **projects** to quickly set up team-based reviews
