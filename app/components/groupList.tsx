import Link from "next/link";
import GroupCard from "@/app/components/groupCard";
import { group } from "@/src/server/types/group";

export default function GroupList({ group }: { group: group }) {
    return (
        <Link href={`/group/${group.groupID}/videos`}>
            <GroupCard group={group} />
        </Link>
    );
}